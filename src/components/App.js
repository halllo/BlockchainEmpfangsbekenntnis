import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import Empfangsbekenntnis from '../abis/Empfangsbekenntnis.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Empfangsbekenntnis.networks[networkId]
    if(networkData) {
      const empfangsbekenntnis = web3.eth.Contract(Empfangsbekenntnis.abi, networkData.address)
      this.setState({ empfangsbekenntnis })
      const documentCount = await empfangsbekenntnis.methods.documentCount().call()
      this.setState({ documentCount })
      // Load documents
      for (var i = 1; i <= documentCount; i++) {
        const document = await empfangsbekenntnis.methods.documents(i).call()
        const documentReads = await empfangsbekenntnis.methods.getReads(i).call()
        document.readers = documentReads._readers;
        document.readAt = documentReads._readAt;
        this.setState({
          documents: [...this.state.documents, document]
        })
      }
      this.setState({ loading: false})
      
      const urlParams = new URLSearchParams(window.location.search);
      const documentLink = urlParams.get('documentLink');
      if (documentLink) {
        this.readDocument(documentLink);
      }
    } else {
      window.alert('Empfangsbekenntnis contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      documentCount: 0,
      documents: [],
      loading: true
    }

    this.sendDocument = this.sendDocument.bind(this)
    this.readDocument = this.readDocument.bind(this)
  }

  sendDocument(documentLink) {
    this.setState({ loading: true })
    this.state.empfangsbekenntnis.methods.sendDocument(documentLink).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  readDocument(documentLink, id, documentLinkHash) {
    this.setState({ loading: true })
    if (!documentLink) {
      documentLink = prompt("documentLink");
    }
    console.info(documentLink);
    this.state.empfangsbekenntnis.methods.readDocument(documentLink).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.info('receipt', receipt);
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  documents={this.state.documents}
                  sendDocument={this.sendDocument}
                  readDocument={this.readDocument} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
