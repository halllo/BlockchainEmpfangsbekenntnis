const Empfangsbekenntnis = artifacts.require('./Empfangsbekenntnis.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Empfangsbekenntnis', ([deployer, sender, reader]) => {
  let empfangsbekenntnis

  before(async () => {
    empfangsbekenntnis = await Empfangsbekenntnis.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await empfangsbekenntnis.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await empfangsbekenntnis.name()
      assert.equal(name, 'Empfangsbekenntnis (§174 Zivilprozessordnung)')
    })
  })

  describe('documents', async () => {
    let result, documentCount

    before(async () => {
      const docLinkHash = await empfangsbekenntnis.hashLink('doc1')
      result = await empfangsbekenntnis.sendDocument(docLinkHash, { from: sender })
      documentCount = await empfangsbekenntnis.documentCount()
    })

    it('sends documents', async () => {
      // SUCCESS
      assert.equal(documentCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink('doc1')
      assert.equal(event.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(event.sender, sender, 'sender is correct')

      // FAILURE: document must have a link
      await await empfangsbekenntnis.sendDocument('', { from: sender }).should.be.rejected;
    })

    it('lists documents', async () => {
      const document = await empfangsbekenntnis.documents(documentCount)
      assert.equal(document.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink('doc1')
      assert.equal(document.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(document.sender, sender, 'sender is correct')
      assert.notEqual(document.sentAt, 0, 'sentAt is correct')
      assert.equal(document.readCount, 0, 'readCount is correct')
    })

    it('read documents', async () => {
      // SUCCESS: reader reads document
      result = await empfangsbekenntnis.readDocument('doc1', { from: reader })
      
      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink('doc1')
      assert.equal(event.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(event.sender, sender, 'sender is correct')
      assert.equal(event.reader, reader, 'reader is correct')
      assert.equal(event.readCount, 1, 'read is correct')

      // FAILURE: Reader tries to read a document that does not exist, i.e., document must have valid id
      await empfangsbekenntnis.readDocument('doc11111', { from: reader }).should.be.rejected;
    })

    it('read document again', async () => {
      // SUCCESS: sender reads document
      result = await empfangsbekenntnis.readDocument('doc1', { from: sender })
      
      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink('doc1')
      assert.equal(event.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(event.sender, sender, 'sender is correct')
      assert.equal(event.reader, sender, 'reader is correct')
      assert.equal(event.readCount, 2, 'read is correct')
    })

    it('lists documents after read', async () => {
      const document = await empfangsbekenntnis.documents(documentCount)
      assert.equal(document.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink('doc1')
      assert.equal(document.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(document.sender, sender, 'sender is correct')
      assert.equal(document.readCount, 2, 'readCount is correct')

      const x = await empfangsbekenntnis.getReads(documentCount);
      const readers = x[0];
      assert.equal(readers.length, 2, 'readers is correct')
      assert.equal(readers[0], reader, 'readers[0] is correct')
      assert.equal(readers[1], sender, 'readers[1] is correct')
    })

  })
})