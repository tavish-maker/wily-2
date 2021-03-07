import * as React from "react"
import { Text, View, TouchableOpacity, StyleSheet, Button, TextInput, Image, Alert, KeyboardAvoidingView, ToastAndroid } from "react-native"
import * as Permissions from "expo-permissions"
import { BarCodeScanner } from "expo-barcode-scanner"
import * as firebase from 'firebase'
import db from '../config'

export default class Transaction extends React.Component {
    constructor() {
        super()
        this.state = {
            cameraPermissions: null,
            scan: false,
            scanData: " ",
            scanBookid: " ",
            scanStudentid: " ",
            transcationMessage: " ",
            buttonState: "normal"
        }
    }
    getCameraPermission = async (id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            cameraPermissions: status === "granted",
            buttonState: id,
            scan: false
        })
    }
    handleBarCodeScanned = async ({ type, data }) => {
        const { buttonState } = this.state

        if (buttonState === "BookId") {
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'
            });
        }
        else if (buttonState === "StudentId") {
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'
            });
        }

    }
    handleTranscation = async () => {
        var transcationMessage
        db.collection("books").doc(this.state.scannedBookId).get()
            .then(doc => {
                var book = doc.data()
                if (book.bookAvailability) {
                    this.intiateBookissue()
                    transcationMessage = "bookissued"
                    ToastAndroid.show(transcationMessage, ToastAndroid.SHORT)

                }
                else {
                    this.intiateBookreturn()
                    transcationMessage = "bookreturned"
                    ToastAndroid.show(transcationMessage, ToastAndroid.SHORT)
                }
            })
        this.setState({
            transcationMessage: transcationMessage
        })
    }
    intiateBookissue = async () => {
        db.collection("transactions").add({
            "studentId": this.state.scanStudentid,
            "bookId": this.state.scannedBookId,
            "date": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "issue"
        })
        db.collection("books").doc(this.state.scanBookid).update({
            "bookAvailability": false
        }
        )
        db.collection("students").doc(this.state.scanStudentid).update({
            "numberofbooksissued": firebase.firestore.FieldValue.increment(1)

        })
        Alert.alert("booksIssued")
        this.setState({
            scannedStudentId: " ",
            scannedBookId: " "
        })
    }
    intiateBookreturn = async () => {
        db.collection("transactions").add({
            "studentId": this.state.scanStudentid,
            "bookId": this.state.scannedBookId,
            "date": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "issue"
        })
        db.collection("books").doc(this.state.scanBookid).update({
            "bookAvailability": true
        }
        )
        db.collection("students").doc(this.state.scanStudentid).update({
            "numberofbooksissued": firebase.firestore.FieldValue.increment(-1)

        })
        Alert.alert("booksReturned")
        this.setState({
            scannedStudentId: " ",
            scannedBookId: " "
        })
    }
    render() {
        const cameraPermissions = this.state.cameraPermissions
        const scan = this.state.scan
        const buttonState = this.state.buttonState
        if (buttonState !== "normal" && cameraPermissions) {
            return (
                <BarCodeScanner
                    onBarCodeScanned={scan ? undefined : this.handleBarCodeScanner}
                    style={StyleSheet.absoluteFillObject} />
            )
        }
        else if (buttonState === "normal") {


            return (
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled >


                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <View>
                            <Image
                                source={require("../assets/booklogo.jpg")}
                                style={{ width: 200, height: 200 }} />
                            <Text style={{ textAlign: "center", fontSize: 30 }}>WILY</Text>
                        </View>
                        <View style={styles.inputView}>
                            <TextInput
                                style={styles.inputBox}
                                placeholder={"bookid"}
                                onChangeText={text => this.setState({ scannedBookId: text })}
                                value={this.state.scanBookid} />
                            <TouchableOpacity style={styles.button}
                                onPress={() => {
                                    this.getCameraPermission("bookid")
                                }}>
                                <Text style={styles.buttonText}>scan</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputView}>
                            <TextInput
                                style={styles.inputBox}
                                placeholder={"studentid"}
                                onChangeText={text => this.setState({ scannedStudentId: text })}
                                value={this.state.scanStudentid} />

                            <TouchableOpacity style={styles.button}
                                onPress={() => {
                                    this.getCameraPermission("studentid")
                                }}>
                                <Text style={styles.buttonText}>scan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}

                                onPress={async () => {
                                    var transactionMessage = this.handleTransaction();
                                    this.setState(
                                        {
                                            scannedBookId: '',
                                            scannedStudentId: ''
                                        })
                                }}>

                                <Text style={styles.buttonText}>Submit</Text>


                            </TouchableOpacity>

                        </View>



                    </View >
                </KeyboardAvoidingView >
            )
        }
    }
}
const styles = StyleSheet.create({
    button: {
        backgroundColor: "blue",
        padding: 10,
        margin: 10,

    },
    buttonText: {
        fontSize: 15,
        fontWeight: "bold"

    },
    inputView: {
        flexDirection: "row",
        margin: 20,

    },
    inputBox: {
        width: 200,
        height: 40,
        borderWidth: 2,

    }
})
