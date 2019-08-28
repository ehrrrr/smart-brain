import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const particlesOptions = {
	particles: {
		number: {
			value: 80,
			density: {
				enable: true,
				value_area: 300
			}
		},
		color: {
			value: '#9fe3f9'
		},
		opacity: {
			value: 0.8,
			random: true,
			anim: {
				enable: true,
				speed: 8,
				opacity_min: 0.4,
				sync: false
			}
		},
		line_linked: {
			color: '#69c8ea',
			shadow: {
				enable: false
			}
		}
	}
};

const initialState = {
	input: '',
	imageUrl: '',
	box: {},
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
		this.setState({
			user: {
				id: data.id,
				name: data.name,
				email: data.email,
				entries: data.entries,
				joined: data.joined
			}
		});
	};
	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputImage');
		const width = Number(image.width);
		const height = Number(image.height);
		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - clarifaiFace.right_col * width,
			bottomRow: height - clarifaiFace.bottom_row * height
		};
	};

	displayFaceBox = (box) => {
		this.setState({ box: box });
	};

	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	};

	onButtonSubmit = () => {
		this.setState({ imageUrl: this.state.input });
		fetch('https://warm-stream-64020.herokuapp.com/imageurl', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: this.state.input
			})
		})
			.then((response) => response.json())
			.then((response) => {
				if (response) {
					fetch('https://warm-stream-64020.herokuapp.com/image', {
						method: 'put',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							id: this.state.user.id
						})
					})
						.then((response) => response.json())
						.then((count) => {
							this.setState(Object.assign(this.state.user, { entries: count }));
						})
						.catch((err) => console.log(err));
				}
				this.displayFaceBox(this.calculateFaceLocation(response));
			})
			.catch((err) => console.log(err));
	};

	onRouteChange = (route) => {
		if (route === 'signout') {
			this.setState(initialState);
		} else if (route === 'home') {
			this.setState({ isSignedIn: 'true' });
		}

		this.setState({ route: route });
	};

	render() {
		return (
			<div className="App">
				<Particles className="particles" params={particlesOptions} />
				<Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
				{this.state.route === 'home' ? (
					<div>
						<Logo />
						<Rank name={this.state.user.name} entries={this.state.user.entries} />
						<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
						<FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
					</div>
				) : this.state.route === 'signin' ? (
					<div>
						<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
					</div>
				) : (
					<div>
						<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
					</div>
				)}
			</div>
		);
	}
}

export default App;
