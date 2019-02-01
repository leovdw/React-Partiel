import React, { Component } from 'react';
import firebase from 'firebase';
import '../views/style/App.css';
import marked from 'marked';


class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            msg: "Hello",
            user: false,
            tablo: [],
            markdowntablo: [],
            message: '',
            btn : '',
            form : '',
            login : function(){
                let googleAuthProvider = new firebase.auth.GoogleAuthProvider();
                googleAuthProvider.addScope('https://www.googleapis.com/auth/plus.login');
                //firebase.auth().languageCode = 'fr'
                firebase.auth().signInWithPopup(googleAuthProvider);
            },
            logout : function(){
                firebase.auth().signOut()
            },
        };
    }


    handleMess(event){
        if (event) {
            event.preventDefault();
        }

        if (this.state.message !== ''){
            let entry = {
                user : this.state.user.displayName,
                ts: new Date().getTime(),
                message: this.state.message
            };

            firebase.database().ref('messages/').push(entry, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    this.setState({
                        message : ''
                    });
                }
            });
        }
    }

    handleMessageChange(e) {
        this.setState({ message: e.target.value });
    }

    handleFile(file){
        if(file.length > 0) {
            const thefile = file[0];
            //const reader = new FileReader();
            // TODO : check si c'est une image
            let img = new Image;
            img.src = URL.createObjectURL(thefile);
            img.onload = () => {
                let canvas = this.refs['imgCanvas'];
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 200, 100);
                canvas.toBlob(blob => {
                    // inject into storage then send msg
                    firebase.storage().ref('images/').child(thefile.name)
                        .put(blob)
                        .then(snapshot => {
                            snapshot.ref.getDownloadURL()
                                .then(downloadURL => {
                                    let currentMessage = this.state.message;
                                    this.setState({
                                        message: currentMessage + "![prout](" + downloadURL + ")"
                                    });
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                });
                        })
                }, 'image/webp', 0.8)
            };
        }
    }

    componentDidMount(){
        firebase.database().ref('messages/').on('value', snapshot => {
            if (snapshot.val() !== null) {
                this.setState({
                        tablo : Object.values(snapshot.val())
                    }, () => {
                        this.markdowntab();
                    }
                );
            }
        });

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    user : user,
                    msg : 'Hi, ' + user.displayName,
                    btn : <button  className="mdc-button mdc-button--raised mdc-ripple-upgraded" onClick={this.state.logout}><span className="mdc-button__label">logout</span></button>,
                    form :  <form onSubmit={(event) => this.handleMess(event)}>
                                <input type="text" value={this.state.message} onChange={ this.handleMessageChange.bind(this) } />
                                <input type="file" onChange={(e) => this.handleFile(e.target.files) } />
                                <input type="submit" className="mdc-button mdc-button--raised mdc-ripple-upgraded"/>
                            </form>
                });
            } else {
                this.setState({
                    user : false,
                    msg : 'Hello there',
                    btn : <button className="mdc-button mdc-button--raised mdc-ripple-upgraded" onClick={this.state.login}>login</button>,
                    form : ''
                });
            }
        });
    }
    markdowntab(){
        if(this.state.tablo.length > 0){
            this.setState({markdowntablo :
                (this.state.tablo).map(entry => {
                return ({
                    ts: entry.ts,
                    user: entry.user,
                    message: marked((entry.message).toString(), {sanitize: true})
                })
            })}
            )
        }
    }

    render() {
        const { show } = this.state;
        return (
            <div className="List">
                <header className="App-header">
                    <div><h3>{this.state.msg}</h3>{this.state.btn}</div>
                    <ul>
                        {this.state.markdowntablo.map(item => (
                             <li className="mdc-list-item" key={item.ts}>
                                 <span className="mdc-list-item__text"> {item.user} :&nbsp; </span><span dangerouslySetInnerHTML={{__html: item.message}}></span>
                             </li>
                            )
                         )}
                    </ul>
                    <canvas ref="imgCanvas"></canvas>
                    {this.state.form}
                </header>
            </div>
        );
    }
}



export default List;
