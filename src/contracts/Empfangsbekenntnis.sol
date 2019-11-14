pragma solidity ^0.5.0;

contract Empfangsbekenntnis {
    string public name;
    uint public documentCount = 0;
    mapping(uint => Document) public documents;

    struct Document {
        uint id;
        bytes32 documentLinkHash;
        address payable sender;
        uint sentAt;
        uint readCount;
        address[] readers;
        uint[] readAt;
    }

    event DocumentSent(
        uint id,
        bytes32 documentLinkHash,
        address payable sender
    );

    event DocumentRead(
        uint id,
        bytes32 documentLinkHash,
        address payable sender,
        address payable reader,
        uint readCount
    );

    constructor() public {
        name = "Empfangsbekenntnis ($174 Zivilprozessordnung)";
    }

    function sendDocument(string memory _documentLink) public {
        // Require a valid name
        require(bytes(_documentLink).length > 0, "must have a document link");
        // Increment document count
        documentCount ++;
        // Hash document link to prevent putting clear text link on chain. Different hashes for same document because of documentNumber in Hash.
        bytes32 _documentLinkHash = hashLink(documentCount, _documentLink);
        // Create the document
        address[] memory emptyAddressArray;
        uint[] memory emptyUintArray;
        documents[documentCount] = Document(documentCount, _documentLinkHash, msg.sender, block.timestamp, 0, emptyAddressArray, emptyUintArray);
        // Trigger an event
        emit DocumentSent(documentCount, _documentLinkHash, msg.sender);
    }

    function readDocument(uint _id, string memory _documentLink) public {
        // Fetch the document
        Document storage _document = documents[_id];
        // Fetch the sender
        address payable _sender = _document.sender;
        address payable _reader = msg.sender;
        // Make sure the document has a valid id
        require(_document.id > 0 && _document.id <= documentCount, "must use valid id");
        // Require that the reader is not the sender
        require(_sender != _reader, "document reader must not be sender");
        // Hash document link and check with stored hash to prevent fraudulent document reading.
        bytes32 _documentLinkHash = hashLink(_id, _documentLink);
        require(_document.documentLinkHash == _documentLinkHash, "must read correct document");
        // Mark as read
        _document.readCount ++;
        _document.readers.push(_reader);
        _document.readAt.push(block.timestamp);
        // Update the document (no longer needed because of storage reference)
        //documents[_id] = _document;
        // Trigger an event
        emit DocumentRead(_document.id, _document.documentLinkHash, _document.sender, _reader, _document.readCount);
    }

    function hashLink(uint256 number, string memory series) public pure returns (bytes32) {
        return keccak256(abi.encode(number, series));
    }

    function getReads(uint256 id) public view returns (address[] memory _readers, uint[] memory _readAt) {
        // Fetch the document
        Document memory _document = documents[id];

        return (_document.readers, _document.readAt);
    }
}
