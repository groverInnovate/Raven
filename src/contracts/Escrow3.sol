// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Escrow
 * @author YASH-ai-bit (Refactored by Gemini)
 * @notice A multi-deal P2P escrow platform using PYUSD where the buyer must respond within 24 hours of funding.
 */
contract Escrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    
    /* ERRORS */
    error Escrow__NotSeller();
    error Escrow__NotBuyer();
    error Escrow__IncorrectDepositAmount();
    error Escrow__InvalidStateForAction();
    error Escrow__DeadlineNotReached();
    error Escrow__TransferFailed();
    error Escrow__DealDoesNotExist();
    error Escrow__BuyerResponseWindowClosed();
    error Escrow__InvalidPrice();
    error Escrow__InvalidAddress();
    error Escrow__SameBuyerAndSeller();
    error Escrow__UnauthorizedCreation();

    /* TYPE DECLARATIONS */

    enum DealStatus {
        CREATED, // Awaiting buyer's funds
        LOCKED, // Buyer has funded, awaiting buyer's action
        DISPUTE_INITIATED, // Buyer has requested a refund, awaiting seller's action
        COMPLETED, // Deal successfully completed, funds paid to seller
        REFUNDED // Deal refunded to buyer
    }

    struct EscrowDeal {
        uint256 dealId;
        address buyer;
        address payable seller;
        uint256 price;
        DealStatus status;
        uint256 sellerResponseDeadline;
        uint256 buyerResponseDeadline;
    }

    /* STATE VARIABLES */
    mapping(uint256 => EscrowDeal) private s_deals;
    uint256 private s_nextDealId;
    
    // Pull payment pattern - track pending withdrawals
    mapping(address => uint256) private s_pendingWithdrawals;
    
    // PYUSD token contract
    IERC20 public immutable pyusdToken;
    
    constructor(address _pyusdToken) Ownable(msg.sender) {
        if (pyusdToken == address(0)) revert Escrow_InvalidAddress();
        pyusdToken = IERC20(_pyusdToken);
    }

    /* EVENTS */
    event DealCreated(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 price);
    event EscrowFunded(uint256 indexed dealId, uint256 buyerDeadline);
    event DisputeInitiated(uint256 indexed dealId, uint256 sellerDeadline);
    event DealCompleted(uint256 indexed dealId);
    event DealRefunded(uint256 indexed dealId);

    /* MODIFIERS */
    modifier onlyBuyer(uint256 _dealId) {
        if (dealId >= s_nextDealId) revert Escrow_DealDoesNotExist();
        if (msg.sender != s_deals[dealId].buyer) revert Escrow_NotBuyer();
        _;
    }

    modifier onlySeller(uint256 _dealId) {
        if (dealId >= s_nextDealId) revert Escrow_DealDoesNotExist();
        if (msg.sender != s_deals[dealId].seller) revert Escrow_NotSeller();
        _;
    }
    
    modifier validDeal(uint256 _dealId) {
        if (dealId >= s_nextDealId) revert Escrow_DealDoesNotExist();
        _;
    }

    /* FUNCTIONS */

    /**
     * @notice Creates a new escrow deal.
     * @param _buyer The address of the buyer.
     * @param _seller The address of the seller.
     * @param _price The price of the service in wei.
     * @return dealId The ID of the newly created deal.
     */
    function createEscrow(address _buyer, address payable _seller, uint256 _price) public whenNotPaused returns (uint256) {
        // Input validation
        if (price == 0) revert Escrow_InvalidPrice();
        if (buyer == address(0) || _seller == address(0)) revert Escrow_InvalidAddress();
        if (buyer == _seller) revert Escrow_SameBuyerAndSeller();
        
        // Access control - only buyer or seller can create their own deals
        if (msg.sender != buyer && msg.sender != _seller) revert Escrow_UnauthorizedCreation();
        
        uint256 dealId = s_nextDealId;
        s_deals[dealId] = EscrowDeal({
            dealId: dealId,
            buyer: _buyer,
            seller: _seller,
            price: _price,
            status: DealStatus.CREATED,
            sellerResponseDeadline: 0,
            buyerResponseDeadline: 0
        });
        s_nextDealId++;
        emit DealCreated(dealId, _buyer, _seller, _price);
        return dealId;
    }

    /**
     * @notice Allows the buyer to deposit the full price for the service using PYUSD.
     * @dev The buyer must have approved this contract to spend the required PYUSD amount.
     * This action locks the deal and starts the buyer's 24-hour response timer.
     * @param _dealId The ID of the deal to fund.
     */
    function fundEscrow(uint256 _dealId) public onlyBuyer(_dealId) whenNotPaused nonReentrant {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.CREATED) revert Escrow__InvalidStateForAction();

        // Transfer PYUSD from buyer to this contract
        pyusdToken.safeTransferFrom(msg.sender, address(this), deal.price);

        deal.status = DealStatus.LOCKED;
        deal.buyerResponseDeadline = block.timestamp + 1 days;
        emit EscrowFunded(_dealId, deal.buyerResponseDeadline);
    }

    /**
     * @notice Allows the buyer to confirm they have received the service and release the funds to the seller.
     * @dev This is the "happy path". Must be called before the buyer's response deadline expires.
     * @param _dealId The ID of the deal to complete.
     */
    function confirmAndReleaseFunds(uint256 _dealId) public onlyBuyer(_dealId) whenNotPaused nonReentrant {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.LOCKED) revert Escrow__InvalidStateForAction();
        if (block.timestamp > deal.buyerResponseDeadline) revert Escrow__BuyerResponseWindowClosed();

        deal.status = DealStatus.COMPLETED;
        
        // Use pull payment pattern instead of direct transfer
        s_pendingWithdrawals[deal.seller] += deal.price;

        emit DealCompleted(_dealId);
    }

    /**
     * @notice Allows the buyer to request a refund, initiating a dispute.
     * @dev Changes the deal's status and starts a 3-day response window for the seller.
     * Must be called before the buyer's response deadline expires.
     * @param _dealId The ID of the deal to dispute.
     */
    function requestRefund(uint256 _dealId) public onlyBuyer(_dealId) whenNotPaused {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.LOCKED) revert Escrow__InvalidStateForAction();
        if (block.timestamp > deal.buyerResponseDeadline) revert Escrow__BuyerResponseWindowClosed();

        deal.status = DealStatus.DISPUTE_INITIATED;
        deal.sellerResponseDeadline = block.timestamp + 3 days;
        emit DisputeInitiated(_dealId, deal.sellerResponseDeadline);
    }

    /**
     * @notice Allows the buyer to claim a full refund if the seller failed to respond to a dispute within the 3-day window.
     * @dev Can only be called after the sellerResponseDeadline has passed.
     * @param _dealId The ID of the deal to refund.
     */
    function claimRefundAfterDeadline(uint256 _dealId) public onlyBuyer(_dealId) whenNotPaused nonReentrant {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.DISPUTE_INITIATED) revert Escrow__InvalidStateForAction();
        if (block.timestamp <= deal.sellerResponseDeadline) revert Escrow__DeadlineNotReached();

        deal.status = DealStatus.REFUNDED;
        
        // Use pull payment pattern
        s_pendingWithdrawals[deal.buyer] += deal.price;

        emit DealRefunded(_dealId);
    }

    /**
     * @notice Allows the seller to claim the funds if the buyer failed to act (confirm or dispute) within their 24-hour window.
     * @dev Can only be called after the buyerResponseDeadline has passed.
     * @param _dealId The ID of the deal to claim.
     */
    function claimFundsAfterDeadline(uint256 _dealId) public onlySeller(_dealId) whenNotPaused nonReentrant {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.LOCKED) revert Escrow__InvalidStateForAction();
        if (block.timestamp <= deal.buyerResponseDeadline) revert Escrow__DeadlineNotReached();

        deal.status = DealStatus.COMPLETED;
        
        // Use pull payment pattern
        s_pendingWithdrawals[deal.seller] += deal.price;

        emit DealCompleted(_dealId);
    }

    /* VIEW FUNCTIONS */

    /**
     * @notice Retrieves the details of a specific escrow deal.
     * @param _dealId The ID of the deal to retrieve.
     * @return The EscrowDeal struct containing all deal information.
     */
    function getDeal(uint256 _dealId) public view validDeal(_dealId) returns (EscrowDeal memory) {
        return s_deals[_dealId];
    }
    
    /**
     * @notice Allows users to withdraw their pending PYUSD funds using pull payment pattern
     * @dev This prevents reentrancy attacks and handles failed transfers gracefully
     */
    function withdraw() public nonReentrant {
        uint256 amount = s_pendingWithdrawals[msg.sender];
        if (amount == 0) revert Escrow__TransferFailed();
        
        s_pendingWithdrawals[msg.sender] = 0;
        
        // SafeTransfer will revert on failure, so we need to handle it
        try this.performSafeTransfer(msg.sender, amount) {
            // Transfer successful
        } catch {
            // Restore the balance if transfer fails
            s_pendingWithdrawals[msg.sender] = amount;
            revert Escrow__TransferFailed();
        }
    }
    
    /**
     * @notice Helper function to perform safe transfer (needed for try-catch)
     * @dev This function is external so it can be used in try-catch
     */
    function performSafeTransfer(address to, uint256 amount) external {
        if (msg.sender != address(this)) revert Escrow__TransferFailed();
        pyusdToken.safeTransfer(to, amount);
    }
    
    /**
     * @notice Returns the pending withdrawal amount for an address
     * @param _user The address to check
     * @return The pending withdrawal amount
     */
    function getPendingWithdrawal(address _user) public view returns (uint256) {
        return s_pendingWithdrawals[_user];
    }
    
    /**
     * @notice Emergency pause function (only owner)
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @notice Emergency unpause function (only owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Get the total number of deals created
     */
    function getTotalDeals() public view returns (uint256) {
        return s_nextDealId;
    }
}