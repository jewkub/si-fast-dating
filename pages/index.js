import React, { useState } from 'react';
import Head from 'next/head';

/* import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Swal = withReactContent(swal); */

class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: null
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
    if (!this.state.user) return (<div>Loading...</div>);
    if (!this.state.user.id) return (
      <div>please <a href="/login">login</a> first</div>
    );
    return (
      <>
        
        <div style={{position: 'absolute', bottom: 0, width: '100%'}}>
          <div className="col" style={{margin: 0, padding: 0}}>
            <div className="list-group list-group-horizontal" id="list-tab" role="tablist" style={{height: '10vh', width: '100%'}}>
              <a className="list-group-item list-group-item-action active" id="list-score-list" data-toggle="list" href="#list-score" role="tab"><img src="https://storage.googleapis.com/simc-web.appspot.com/public/web/scoreboard/user.png" alt="score"/></a>
              <a className="list-group-item list-group-item-action" id="list-mission-list" data-toggle="list" href="#list-mission" role="tab"><img src="https://storage.googleapis.com/simc-web.appspot.com/public/web/scoreboard/mission.png" alt="mission"/></a>
              <a className="list-group-item list-group-item-action" id="list-board-list" data-toggle="list" href="#list-board" role="tab"><img src="https://storage.googleapis.com/simc-web.appspot.com/public/web/scoreboard/board.png" alt="board"/></a>
            </div>
          </div>
        </div>

        <div className="tab-content">
          <div className="tab-pane active" id="list-score" role="tabpanel">..score.</div>
          <div className="tab-pane" id="list-mission" role="tabpanel">.mission..</div>
          <div className="tab-pane" id="list-board" role="tabpanel">..board.</div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossOrigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.15.0/umd/popper.min.js" integrity="sha256-fTuUgtT7O2rqoImwjrhDgbXTKUwyxxujIMRIK7TbuNU=" crossOrigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha256-CjSoeELFOcH0/uxWu6mC/Vlrc1AARqbm/jiiImDGV3s=" crossOrigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/8.11.8/sweetalert2.min.js" integrity="sha256-7OUNnq6tbF4510dkZHCRccvQfRlV3lPpBTJEljINxao=" crossOrigin="anonymous"></script>
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          <title>SI Fast Dating 💖</title>
          <link rel="stylesheet" type="text/css" href="css/scoreboard-sass.css"/>
          <link rel="stylesheet" type="text/css" href="css/index.css"/>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/8.11.8/sweetalert2.min.css" integrity="sha256-2bAj1LMT7CXUYUwuEnqqooPb1W0Sw0uKMsqNH0HwMa4=" crossorigin="anonymous" />
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