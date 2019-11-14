pragma solidity ^0.5.0;

contract Empfangsbekenntnis {
    string public name;
    uint public documentCount = 0;
    mapping(uint => Document) public documents;
    mapping(bytes32 => uint[]) public documentLinkHashToDocuments;

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
        name = "Empfangsbekenntnis (§174 Zivilprozessordnung)";
    }

    function sendDocument(string memory _documentLink) public {
        // Require a valid name
        require(bytes(_documentLink).length > 0, "must have a document link");
        // Increment document count
        documentCount ++;
        // Hash document link to prevent putting clear text link on chain. Different hashes for same document because of documentNumber in Hash.
        bytes32 _documentLinkHash = hashLink(_documentLink);
        // Create the document
        address[] memory emptyAddressArray;
        uint[] memory emptyUintArray;
        documents[documentCount] = Document(documentCount, _documentLinkHash, msg.sender, block.timestamp, 0, emptyAddressArray, emptyUintArray);
        documentLinkHashToDocuments[_documentLinkHash].push(documentCount);
        // Trigger an event
        emit DocumentSent(documentCount, _documentLinkHash, msg.sender);
    }

    function readDocument(string memory _documentLink) public {
        address payable _reader = msg.sender;
        // Hash document link to check with stored hashes to prevent fraudulent document reading.
        bytes32 _documentLinkHash = hashLink(_documentLink);
        // Fetch the documents
        uint[] memory _documentIds = documentLinkHashToDocuments[_documentLinkHash];
        require(_documentIds.length > 0, "must read correct document");
        for (uint i = 0; i < _documentIds.length; i++) {
            uint _documentId = _documentIds[i];
            Document storage _document = documents[_documentId];
            // Mark as read
            _document.readCount ++;
            _document.readers.push(_reader);
            _document.readAt.push(block.timestamp);
            // Update the document
            //documents[_documentId] = _document; (no longer needed since we update a storage reference)
            // Trigger an event
            emit DocumentRead(_document.id, _document.documentLinkHash, _document.sender, _reader, _document.readCount);
        }
    }

    function hashLink(string memory series) public pure returns (bytes32) {
        return keccak256(abi.encode(series));
    }

    function getReads(uint256 id) public view returns (address[] memory _readers, uint[] memory _readAt) {
        // Fetch the document
        Document memory _document = documents[id];

        return (_document.readers, _document.readAt);
    }
}
