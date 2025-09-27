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

    /* ENUMS */

    enum ListingStatus {
        CREATED, LOCKED, INDISPUTED, COMPLETED, REFUNDED
    }

    /* EVENTS */

    event EscrowIsLocked(address indexed seller, address indexed buyer, calldata);
    // event EscrowChatIsStarted(address indexed seller, address indexed buyer, calldata);
    event DisputeResolved(address indexed seller, address indexed buyer, calldata);
    event BuyerFlagged(address indexed seller, address indexed buyer, calldata);
    event SellerFlagged(address indexed seller, address indexed buyer, calldata);


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
    address public s_buyer;
    address public s_seller; // probably stealth address
    uint256 immutable i_price;
    ListingStatus public listingStatus;
    
    struct ListingOrder{
        address seller,
        string service,
        address buyer,
        ListingStatus listingStatus,
    }

    /* FUNCTIONS */
    constructor(address _seller, address _buyer, uint256 _price){
        s_seller = _seller;
        s_buyer = _buyer;
        i_price = _price;
        listingStatus = ListingStatus.CREATED;
    }

    /**
     * @dev after the deposition by buyer, the escrow locks instantly! Refund can be claimed only after seller stakes for security.
     */

    function depositByBuyer() public payable onlyBuyer {
        if(msg.value < i_price){
            revert Escrow__NotEnoughBalance();
        }
        address(this).balance() += msg.value;
        listingStatus = ListingStatus.LOCKED;
    };

    /**
     * @dev after the deposition by buyer - Escrow is marked LOCKED for atleast 3 days or so, in that case after days refund will be done to the buyer. But for chat opening seller has to stake for security (10% of i_price i.e. orice of service).s
     */

    function depositBySeller() public payable onlySeller {
        if(msg.value < .1*i_price){
            revert Escrow__NotEnoughSecurityStake();
        }
        address(this).balance() += msg.value;
        listingStatus = ListingStatus.
    };

    /**
     * @dev 3 days window period started for seller to respond
     */

    function requestRefund() public onlyBuyer {
        //timelocks implementation
        
    };

    /**
     * @dev after dispute has been resolved and the seller has been found guilty, buyer can claim it successfully
     */

    function claimRefund() public onlyBuyer {
        
    };
    function claimFundsAfterDeadline() public onlySeller {};

}