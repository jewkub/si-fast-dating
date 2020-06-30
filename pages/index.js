import React, { useState } from 'react';
import Head from 'next/head';

/* import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Swal = withReactContent(swal); */

class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: {id: null}
    }
  }

  async componentDidMount() {
    let res = await fetch('/user')
    let data = await res.json();
    this.setState({
      user: data
    });
  }
  
  render() {
    if (!this.state.user.id) return (
      <div>please <a href="/login">login</a> first</div>
    );
    return (
      <>
        <h2>Test</h2>
      </>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <>
        <Head>
          <meta charSet="utf-8"/>
          <title>Title</title>
          <meta name="description" content=""/>
        </Head>
        <Main
          
        />
      </>
    )
  }
}

/* App.getInitialProps = async ({pathname, query, asPath, req, res, err}) => {
  return { teamName: query.teamName, teamId: query.teamId };
};  // https://stackoverflow.com/a/57977450/4468834 */

export default App;