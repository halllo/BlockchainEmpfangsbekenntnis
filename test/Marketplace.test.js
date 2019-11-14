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
      assert.equal(name, 'Empfangsbekenntnis ($174 Zivilprozessordnung)')
    })
  })

  describe('documents', async () => {
    let result, documentCount

    before(async () => {
      result = await empfangsbekenntnis.sendDocument('doc1', { from: sender })
      documentCount = await empfangsbekenntnis.documentCount()
    })

    it('sends documents', async () => {
      // SUCCESS
      assert.equal(documentCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink(1, 'doc1')
      assert.equal(event.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(event.sender, sender, 'sender is correct')
      assert.equal(event.read, false, 'read is correct')

      // FAILURE: document must have a link
      await await empfangsbekenntnis.sendDocument('', { from: sender }).should.be.rejected;
    })

    it('lists documents', async () => {
      const product = await empfangsbekenntnis.documents(documentCount)
      assert.equal(product.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink(1, 'doc1')
      assert.equal(product.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(product.sender, sender, 'sender is correct')
      assert.equal(product.read, false, 'read is correct')
    })

    it('read documents', async () => {
      // SUCCESS: reader reads document
      result = await empfangsbekenntnis.readDocument(documentCount, 'doc1', { from: reader })
      
      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), documentCount.toNumber(), 'id is correct')
      const docLinkHash = await empfangsbekenntnis.hashLink(1, 'doc1')
      assert.equal(event.documentLinkHash, docLinkHash, 'link is correct')
      assert.equal(event.sender, sender, 'sender is correct')
      assert.equal(event.reader, reader, 'reader is correct')
      assert.equal(event.read, true, 'read is correct')

      // FAILURE: Reader tries to read a document that does not exist, i.e., document must have valid id
      await empfangsbekenntnis.readDocument(99, 'doc1', { from: reader }).should.be.rejected;
      // FAILURE: Sender tries to read document, i.e., sender can't read his document
      await empfangsbekenntnis.readDocument(documentCount, 'doc1', { from: sender }).should.be.rejected;
      // FAILURE: Reader tries to read again, i.e., reader can't read twice
      await empfangsbekenntnis.readDocument(documentCount, 'doc1', { from: reader }).should.be.rejected;
    })

  })
})