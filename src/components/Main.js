import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div id="content">
        <h1>Document</h1>
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
          <button className="btn btn-primary ml-2"
            name="readDocument"
            onClick={(event) => {
              let documentLink = this.documentLink.value;
              if (documentLink) {
                this.props.readDocument(documentLink);
              } else {
                alert("enter document link");
              }
            }}
          >
            Receive Document
          </button>
        </form>
        <p>&nbsp;</p>
        <h2>Sent</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Document Link Hash</th>
              <th scope="col">Sender</th>
              <th scope="col">Sent At</th>
              <th scope="col">Received By</th>
              <th scope="col">Received At</th>
            </tr>
          </thead>
          <tbody id="documentList">
            { this.props.documents.map((document, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{document.id.toString()}</th>
                  <td>{document.documentLinkHash}</td>
                  <td>{document.sender}</td>
                  <td>{toDate(document.sentAt)}</td>
                  <td>
                    { document.readers.map((read, readKey) => 
                      <span key={key + '_reader' + readKey}>{read}, </span>
                    )}
                  </td>
                  <td>
                    { document.readAt.map((read, readKey) => 
                      <span key={key + '_readAt' + readKey}>{toDate(read)}, </span>
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

function toDate(unixTimestamp) {
  let unixTimestampDec = parseInt(unixTimestamp);
  let dateObj = new Date(unixTimestampDec * 1000); 
  return dateObj.toString();
}

export default Main;
