import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div id="content">
        <h1>Send Document</h1>
        <form onSubmit={(event) => {
          event.preventDefault()
          const documentLink = this.documentLink.value
          this.props.sendDocument(documentLink)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="documentLink"
              type="text"
              ref={(input) => { this.documentLink = input }}
              className="form-control"
              placeholder="Document Link"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Send Document</button>
        </form>
        <p>&nbsp;</p>
        <h2>Read Document</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">DocumentLink</th>
              <th scope="col">Sender</th>
              <th scope="col"></th>
              <th scope="col">Readers</th>
            </tr>
          </thead>
          <tbody id="documentList">
            { this.props.documents.map((document, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{document.id.toString()}</th>
                  <td>{document.documentLinkHash}</td>
                  <td>{document.sender}</td>
                  <td>
                    <button
                      name={document.id}
                      value={document.documentLinkHash}
                      onClick={(event) => {
                        this.props.readDocument(event.target.name, event.target.value)
                      }}
                    >
                      Read
                    </button>
                  </td>
                  <td>
                    { document.reads.map(r => 
                      <span>{r}, </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
