import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

// Particles.js options
const particleOptions = {
    particles: {
        number: {
            value: 30,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
};

const initialState = {
    input: '',
    imageUrl: '',
    box: { },
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
};

class App extends Component {
    constructor() {
        super();
        this.state = initialState;
    }

    loadUser = (data) => {
        this.setState({user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        }})
    };

    // Calculates the location of the box to be drawn on the face, returns the locations to display function
    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    };

    // Updates state for face box
    displayFaceBox = (box) => {
        this.setState({box: box});
    };

    // Updates state for URL changes
    onInputChange = (event) => {
        this.setState({input: event.target.value});
    };

    // Gets Clarifai response on submission, calculates face location and displays the face box
    onButtonSubmit = () => {
        this.setState( {imageUrl: this.state.input} );
        fetch('https://boiling-falls-67868.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response) {
                    fetch('https://boiling-falls-67868.herokuapp.com/image', {
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(response => response.json())
                        .then(count => {
                            // object.assign necessary to only update the entries
                            this.setState(Object.assign(this.state.user, { entries: count }));
                        })
                        .catch(console.log);
                }
            this.displayFaceBox(this.calculateFaceLocation(response))
            })
            .catch(err => console.log(err));
    };

    // Change routing depending on what page you are on
    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState);
        } else if (route === 'home') {
            this.setState({isSignedIn: true});
        }
        this.setState({route: route});
    };

    render() {
        const { isSignedIn, imageUrl, route, box } = this.state;
        return (
          <div className="App">
            <Particles className='particles'
                params={particleOptions}
            />
            <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
              { route === 'home'
                ? <div>
                  <Logo />
                  <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                  <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
                  <FaceRecognition box={box} imageUrl={imageUrl} />
                  </div>
                : (
                    route === 'signin'
                    ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                    : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                  )
              }
          </div>
        );
    }
}

export default App;
