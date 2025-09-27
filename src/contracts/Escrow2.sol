// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title Escrow
 * @notice A multi-deal P2P escrow platform where the buyer must respond within 24 hours of funding.
 */
contract Escrow {
    /* ERRORS */
    error Escrow__NotSeller();
    error Escrow__NotBuyer();
    error Escrow__IncorrectDepositAmount();
    error Escrow__InvalidStateForAction();
    error Escrow__DeadlineNotReached();
    error Escrow__TransferFailed();
    error Escrow__DealDoesNotExist();
    error Escrow__BuyerResponseWindowClosed();

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

    /* EVENTS */
    event DealCreated(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 price);
    event EscrowFunded(uint256 indexed dealId, uint256 buyerDeadline);
    event DisputeInitiated(uint256 indexed dealId, uint256 sellerDeadline);
    event DealCompleted(uint256 indexed dealId);
    event DealRefunded(uint256 indexed dealId);

    /* MODIFIERS */
    modifier onlyBuyer(uint256 _dealId) {
        if (msg.sender != s_deals[_dealId].buyer) revert Escrow__NotBuyer();
        _;
    }

    modifier onlySeller(uint256 _dealId) {
        if (msg.sender != s_deals[_dealId].seller) revert Escrow__NotSeller();
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
    function createEscrow(address _buyer, address payable _seller, uint256 _price) public returns (uint256) {
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
     * @notice Allows the buyer to deposit the full price for the service.
     * @dev The sent `msg.value` must match the deal price. This action locks the deal
     * and starts the buyer's 24-hour response timer.
     * @param _dealId The ID of the deal to fund.
     */
    function fundEscrow(uint256 _dealId) public payable onlyBuyer(_dealId) {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.CREATED) revert Escrow__InvalidStateForAction();
        if (msg.value != deal.price) revert Escrow__IncorrectDepositAmount();

        deal.status = DealStatus.LOCKED;
        deal.buyerResponseDeadline = block.timestamp + 1 days;
        emit EscrowFunded(_dealId, deal.buyerResponseDeadline);
    }

    /**
     * @notice Allows the buyer to confirm they have received the service and release the funds to the seller.
     * @dev This is the "happy path". Must be called before the buyer's response deadline expires.
     * @param _dealId The ID of the deal to complete.
     */
    function confirmAndReleaseFunds(uint256 _dealId) public onlyBuyer(_dealId) {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.LOCKED) revert Escrow__InvalidStateForAction();
        if (block.timestamp > deal.buyerResponseDeadline) revert Escrow__BuyerResponseWindowClosed();

        deal.status = DealStatus.COMPLETED;
        (bool success, ) = deal.seller.call{value: deal.price}("");
        if (!success) revert Escrow__TransferFailed();

        emit DealCompleted(_dealId);
    }

    /**
     * @notice Allows the buyer to request a refund, initiating a dispute.
     * @dev Changes the deal's status and starts a 3-day response window for the seller.
     * Must be called before the buyer's response deadline expires.
     * @param _dealId The ID of the deal to dispute.
     */
    function requestRefund(uint256 _dealId) public onlyBuyer(_dealId) {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.LOCKED) revert Escrow__InvalidStateForAction();
        if (block.timestamp > deal.buyerResponseDeadline) revert Escrow__BuyerResponseWindowClosed();

        deal.status = DealStatus.DISPUTE_INITIATED;
        deal.sellerResponseDeadline = block.timestamp + 3 days;
        emit DisputeInitiated(_dealId, deal.sellerResponseDeadline);
    }

    /**
     * @notice Allows the buyer to claim a full refund if the seller failed to respond to a dispute within the 3-day window.
     * @dev Can only be called after the `sellerResponseDeadline` has passed.
     * @param _dealId The ID of the deal to refund.
     */
    function claimRefundAfterDeadline(uint256 _dealId) public onlyBuyer(_dealId) {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.DISPUTE_INITIATED) revert Escrow__InvalidStateForAction();
        if (block.timestamp <= deal.sellerResponseDeadline) revert Escrow__DeadlineNotReached();

        deal.status = DealStatus.REFUNDED;
        (bool success, ) = deal.buyer.call{value: deal.price}("");
        if (!success) revert Escrow__TransferFailed();

        emit DealRefunded(_dealId);
    }

    /**
     * @notice Allows the seller to claim the funds if the buyer failed to act (confirm or dispute) within their 24-hour window.
     * @dev Can only be called after the `buyerResponseDeadline` has passed.
     * @param _dealId The ID of the deal to claim.
     */
    function claimFundsAfterDeadline(uint256 _dealId) public onlySeller(_dealId) {
        EscrowDeal storage deal = s_deals[_dealId];
        if (deal.status != DealStatus.LOCKED) revert Escrow__InvalidStateForAction();
        if (block.timestamp <= deal.buyerResponseDeadline) revert Escrow__DeadlineNotReached();

        deal.status = DealStatus.COMPLETED;
        (bool success, ) = deal.seller.call{value: deal.price}("");
        if (!success) revert Escrow__TransferFailed();

        emit DealCompleted(_dealId);
    }

    /* VIEW FUNCTIONS */

    /**
     * @notice Retrieves the details of a specific escrow deal.
     * @param _dealId The ID of the deal to retrieve.
     * @return The EscrowDeal struct containing all deal information.
     */
    function getDeal(uint256 _dealId) public view returns (EscrowDeal memory) {
        if (_dealId >= s_nextDealId) revert Escrow__DealDoesNotExist();
        return s_deals[_dealId];
    }
}