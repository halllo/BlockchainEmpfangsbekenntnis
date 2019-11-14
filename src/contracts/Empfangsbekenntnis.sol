pragma solidity ^0.5.0;

contract Empfangsbekenntnis {
    string public name;
    uint public documentCount = 0;
    mapping(uint => Document) public documents;

    struct Document {
        uint id;
        bytes32 documentLinkHash;
        address payable sender;
        address payable reader;
        bool read;
    }

    event DocumentSent(
        uint id,
        bytes32 documentLinkHash,
        address payable sender,
        bool read
    );

    event DocumentRead(
        uint id,
        bytes32 documentLinkHash,
        address payable sender,
        address payable reader,
        bool read
    );

    constructor() public {
        name = "Empfangsbekenntnis ($174 Zivilprozessordnung)";
    }

    function sendDocument(string memory _documentLink) public {
        // Require a valid name
        require(bytes(_documentLink).length > 0, "must have a document link");
        // Increment product count
        documentCount ++;
        // Hash document link to prevent putting clear text link on chain. Different hashes for same document because of documentNumber in Hash.
        bytes32 _documentLinkHash = hashLink(documentCount, _documentLink);
        // Create the product
        documents[documentCount] = Document(documentCount, _documentLinkHash, msg.sender, address(0), false);
        // Trigger an event
        emit DocumentSent(documentCount, _documentLinkHash, msg.sender, false);
    }

    function readDocument(uint _id, string memory _documentLink) public {
        // Fetch the product
        Document memory _document = documents[_id];
        // Fetch the owner
        address payable _sender = _document.sender;
        // Make sure the product has a valid id
        require(_document.id > 0 && _document.id <= documentCount, "must use valid id");
        // Require that the product has not been purchased already
        require(!_document.read, "must read unread document");
        // Require that the buyer is not the seller
        require(_sender != msg.sender, "document reader must not be sender");
        // Hash document link and check with stored hash to prevent fraudulent document reading.
        bytes32 _documentLinkHash = hashLink(_id, _documentLink);
        require(_document.documentLinkHash == _documentLinkHash, "must read correct document");
        // Transfer ownership to the buyer
        _document.reader = msg.sender;
        // Mark as purchased
        _document.read = true;
        // Update the product
        documents[_id] = _document;
        // Trigger an event
        emit DocumentRead(_document.id, _document.documentLinkHash, _document.sender, _document.reader, true);
    }

    function hashLink(uint256 number, string memory series) public pure returns (bytes32) {
        return keccak256(abi.encode(number, series));
    }
}
