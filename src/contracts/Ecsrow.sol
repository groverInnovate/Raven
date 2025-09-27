// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.30

contract Escrow {

    /* ERRORS */
    error Escrow__NotSeller();
    error Escrow__NotBuyer();
    error Escrow__NotEnoughBalance();
    error Escrow__NotEnoughSecurityStake();

    /* TYPE DECLARATIONS */

    enum ListingStatus {
        CREATED, LOCKED, INDISPUTED, COMPLETED, REFUNDED
    }

    struct ListingOrder{
        uint256 s_OrderId,
        address payable s_seller,
        uint256 immutable i_price,
        address s_buyer,
        ListingStatus listingStatus,
        uint256 sellerResponseForDeadline,
        uint256 buyerResponseForDeadline
    }

    /* EVENTS */

    event EscrowIsLocked(address indexed seller, address indexed buyer, calldata);
    // event EscrowChatIsStarted(address indexed seller, address indexed buyer, calldata);
    event DisputeResolved(address indexed seller, address indexed buyer, calldata);
    event BuyerFlagged(address indexed seller, address indexed buyer, calldata);
    event SellerFlagged(address indexed seller, address indexed buyer, calldata);
    event EscrowCreated(uint256 indexed orderId, address buyer);


    /* MODIFIERS */
    modifier onlySeller(){
        if(msg.sender != seller) {
            revert Escrow__NotSeller();
        }
        _;
    }

    modifier onlyBuyer(){
        if(msg.sender != buyer) {
            revert Escrow__NotBuyer();
        }
        _;
    }

    /* STATE VARIABLES */
    uint256 private s_nextDealId;
    mapping(uint256 => ListingOrder) private s_orders;
    

    /* FUNCTIONS */
    // constructor(/*address _seller*/ address _buyer, uint256 _price){
    //     // s_seller = _seller;
    //     s_buyer = _buyer;
    //     i_price = _price;
    //     listingStatus = ListingStatus.CREATED;
    // }

    function createEscrow(address _seller, address _buyer, address _price){
        uint256 dealId = s_nextDealId;
        s_deals[dealId] = ListingOrder{
            s_dealId: dealId,
            s_seller: _seller,
            i_price: _price,
            s_buyer: _buyer,
            listingStatus: ListingStatus.CREATED,
            sellerResponseForDeadline: 0,
            buyerResponseForDeadline: 0
        };
        s_next
    }

    /**
     * @dev after the deposition by buyer, the escrow locks instantly!
     */

    function depositByBuyer() public payable onlyBuyer {
        if(msg.value < i_price){
            revert Escrow__NotEnoughBalance();
        }
        address(this).balance += msg.value;
        listingStatus = ListingStatus.LOCKED;
    };

    // /**
    //  * @dev after the deposition by buyer - Escrow is marked LOCKED for atleast 3 days or so, in that case after days refund will be done to the buyer. But for chat opening seller has to stake for security (10% of i_price i.e. orice of service).s
    //  */

    // function depositBySeller() public payable onlySeller {
    //     if(msg.value < .1*i_price){
    //         revert Escrow__NotEnoughSecurityStake();
    //     }
    //     address(this).balance += msg.value;
    //     listingStatus = ListingStatus.
    // };

    function confirmReceipt()public onlyBuyer{

    }

    function claimDefaultForSeller() external {}

    /**
     * @dev 3 days window period started for seller to respond
     */

    function requestRefund() public onlyBuyer {
        //timelocks implementation
        block.timestamp + 72*3600;

            
    }

    /**
     * @dev after dispute has been resolved and the seller has been found guilty, buyer can claim it successfully
     */

    function claimRefund() public onlyBuyer {
        address payable receipent = msg.sender;
        (bool success, ) = receipent.call{value: address(this).balance}(");
    }

    /**
     * @dev this function sends buyer's locked funds to seller after 1 day of receiving the service
     */

    function claimFundsAfterDeadline() public onlySeller {

    };

}