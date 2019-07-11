import React, {Component} from 'react';
import {Row, Col, PageHeader, Menu, Dropdown, Icon} from "antd"

import Editor from 'draft-js-plugins-editor';
import {EditorState, ContentState, RichUtils, convertToRaw, Modifier} from 'draft-js';

//import "../../../node_modules/draft-js/dist/Draft.css"
import createFocusPlugin from 'draft-js-focus-plugin';

import createCounterPlugin from 'draft-js-counter-plugin';

import createUndoPlugin from 'draft-js-undo-plugin';

import createHighlightPlugin from "./plugins/highlightPlugin";

import "./index.css"


// Creates an Instance. At this step, a configuration object can be passed in
// as an argument.
const highlightPlugin = createHighlightPlugin();

const undoPlugin = createUndoPlugin();
const {UndoButton, RedoButton} = undoPlugin;

const counterPlugin = createCounterPlugin();

// Extract a counter from the plugin.
const {CharCounter} = counterPlugin;

const focusPlugin = createFocusPlugin();


const plugins = [
	focusPlugin,
	counterPlugin,
	undoPlugin,
	highlightPlugin
];

const MAX_LENGTH = 2000;


class EditorPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editorState: EditorState.createEmpty(),
			note: {
				id: 1,
				content: "Sky World Limited is an innovative IT service provider company engaging its customer with " +
					"hosted online applications and content. We recognize the organic nature of IT systems and the increase in" +
					" the rate of change enabled by the Mobile, Internet and globalization. We are a leading provider of CSP " +
					"technology while offering customer oriented and unique services that enable their competitive advantage."
			},
			content: "Sky World Limited is an innovative IT service provider company engaging its customer with " +
				"hosted online applications and content. We recognize the organic nature of IT systems and the increase in" +
				" the rate of change enabled by the Mobile, Internet and globalization. We are a leading provider of CSP " +
				"technology while offering customer oriented and unique services that enable their competitive advantage.",
			displayedNote: 1,
			visible: false,
			charsTyped: 0,
			messageCount: 0,
			remainingChars:0
		};
	}

	onChange = (editorState) => {
		this.setState({editorState: editorState});
	};

	handleMenuClick = e => {
		console.log("Here is e ", e.item.props.children);

		this.insert(e.item.props.children);

		if (e.key === '3') {
			this.setState({visible: false});
		}
	};

	handleVisibleChange = flag => {
		this.setState({visible: flag});
	};

	handleKeyCommand = (command) => {
		const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
		if (newState) {
			this.onChange(newState);
			return 'handled';
		}
		return 'not-handled';
	};

	/*onUnderlineClick = () => {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
	};

	onBoldClick = () => {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'))
	};

	onItalicClick = () => {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'))
	};*/


	_handleBeforeInput = () => {
		const currentContent = this.state.editorState.getCurrentContent();
		const currentContentLength = currentContent.getPlainText('').length;

		if (currentContentLength > MAX_LENGTH - 1) {
			console.log(currentContentLength);
			console.log('you can type max ten characters');

			return 'handled';
		}
	};

	_handlePastedText = (pastedText) => {
		const currentContent = this.state.editorState.getCurrentContent();
		const currentContentLength = currentContent.getPlainText('').length;

		if (currentContentLength + pastedText.length > MAX_LENGTH) {
			console.log(currentContentLength);
			console.log('you can type max ten characters');

			return 'handled';
		}
	};

	/*onHighlight = () => {
		this.onChange(
			RichUtils.toggleInlineStyle(this.state.editorState, "HIGHLIGHT")
		);
	};*/

	componentDidMount() {
		/*if (this.state.note === null) {
			this.setState({
				displayedNote: "new",
				editorState: EditorState.createEmpty(),
			})
		} else {
			this.setState({
				displayedNote: this.state.note.id,
				editorState:
					EditorState.createWithContent(convertFromRaw(this.buildEditorContent(this.state.note.content))),
				charsTyped: this.getLengthOfText(),
				messageCount: this.getMessageCount(),
			});

			this.handleCharacterCount();
		}*/

		this.setState({
			displayedNote: this.state.note.id,
			editorState:EditorState.createWithContent(ContentState.createFromText(this.state.content)),
			charsTyped: this.getLengthOfText(),
			messageCount: this.getMessageCount(),
			remainingChars: this.getRemainingCharsCount()
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if(prevState.editorState !== this.state.editorState){
			this.setState({
				charsTyped: this.getLengthOfText(),
				messageCount: this.getMessageCount(),
				remainingChars: this.getRemainingCharsCount()
				//messageCount:

			});
		}
		/*if (prevProps.note == null && !this.state.note) {
			this.setState({
				displayedNote: this.state.note.id,
				editorState:EditorState.createWithContent(ContentState.createFromText(this.state.content)),
				//charsTyped: this.getLengthOfText(),
				//messageCount:

			})
		}*/
	}

	insert = (text) => {
		const {editorState} = this.state;
		let contentState = editorState.getCurrentContent();
		const selectionState = editorState.getSelection();
		const contentStateWithEntity = contentState.createEntity('MY_ENTITY_TYPE', 'IMMUTABLE');
		const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

		// Check if there is no selected text
		if(this.getLengthOfSelectedText() === 0){
			contentState = Modifier.insertText(contentState, selectionState, ' ');
			contentState = Modifier.insertText(
				contentState,
				selectionState,
				text,
				['BOLD', 'HIGHLIGHT'],
				entityKey
			);

			let newState = EditorState.push(
				editorState,
				contentState,
				'insert-characters'
			);

			if (!newState.getCurrentContent().equals(editorState.getCurrentContent())) {
				const sel = newState.getSelection();
				const updatedSelection = sel.merge({
					anchorOffset: sel.getAnchorOffset() + 1,
					focusOffset: sel.getAnchorOffset() + 1
				});
				// Forcing the current selection ensures that it will be at it's right place.
				newState = EditorState.forceSelection(
					newState,
					updatedSelection,
				)
			}
			this.setState({editorState: newState})
		}
	};

	getLengthOfText = () => {
		const contentState = this.state.editorState.getCurrentContent();
		return contentState.getPlainText().length
	};

	getMessageCount = () => {
		let messages = 0;

		let count = this.getLengthOfText();

		if(count > 0){
			messages = Math.ceil(count / 160);
		}
		return messages;
	};

	getRemainingCharsCount = () => {
		const charCount = this.getLengthOfText();
		const messages = this.getMessageCount();
		let	remaining = 0;
		if(messages <= 1){
			remaining = messages * 160 - (charCount % (messages * 160) || messages * 160);
		}else{
			remaining = (((messages-1) * 160) + 160) - (charCount % (messages * 160) || messages * 160);
		}

		return remaining
	};


	getLengthOfSelectedText = () => {
		const currentSelection = this.state.editorState.getSelection();
		const isCollapsed = currentSelection.isCollapsed();

		let length = 0;

		if (!isCollapsed) {
			const currentContent = this.state.editorState.getCurrentContent();
			const startKey = currentSelection.getStartKey();
			const endKey = currentSelection.getEndKey();
			const startBlock = currentContent.getBlockForKey(startKey);
			const isStartAndEndBlockAreTheSame = startKey === endKey;
			const startBlockTextLength = startBlock.getLength();
			const startSelectedTextLength = startBlockTextLength - currentSelection.getStartOffset();
			const endSelectedTextLength = currentSelection.getEndOffset();
			const keyAfterEnd = currentContent.getKeyAfter(endKey);
			console.log(currentSelection)
			if (isStartAndEndBlockAreTheSame) {
				length += currentSelection.getEndOffset() - currentSelection.getStartOffset();
			} else {
				let currentKey = startKey;

				while (currentKey && currentKey !== keyAfterEnd) {
					if (currentKey === startKey) {
						length += startSelectedTextLength + 1;
					} else if (currentKey === endKey) {
						length += endSelectedTextLength;
					} else {
						length += currentContent.getBlockForKey(currentKey).getLength() + 1;
					}

					currentKey = currentContent.getKeyAfter(currentKey);
				};
			}
		}

		return length;
	};

	submitEditor = () => {
		const contentState = this.state.editorState.getCurrentContent();
		let message = {content: convertToRaw(contentState)};
		message["content"] = JSON.stringify(message.content);
		console.log("Here is the message ", message);
	};

	render() {

		console.log("Here are the selected text ", this.getLengthOfSelectedText());
		return (
			<React.Fragment>
				<PageHeader
					style={{margin: '16px 0'}}
					title="Editor"
					subTitle="An Editor using Draft Js"
				/>
				<div style={{padding: 24, minHeight: 280}}>
					<Row>
						<Col span={24}>
							<div className="editorContainer">
								<div className="editors">
									<div className="editorButtons">
										<Row>
											<Col span={24}>
												{/*<button onClick={this.onUnderlineClick}>U</button>
												<button onClick={this.onBoldClick}><b>B</b></button>
												<button onClick={this.onItalicClick}><em>I</em></button>*/}
												<UndoButton/>
												<RedoButton/>
												{/*<button className="highlight" onClick={this.onHighlight}>
													<span style={{background: "yellow", padding: "0.3em"}}>H</span>
												</button>*/}

												<Dropdown
													overlay={(
														<Menu onClick={this.handleMenuClick}>
															<Menu.Item key="1">NAME</Menu.Item>
															<Menu.Item key="2">COMPANY</Menu.Item>
															<Menu.Item key="3">AGE</Menu.Item>
														</Menu>
													)}
													onVisibleChange={this.handleVisibleChange}
													visible={this.state.visible}
													placement="bottomLeft"
												>
											<span style={{float: "right"}}>
												Variable <Icon type="down"/>
											</span>
												</Dropdown>
											</Col>
										</Row>
									</div>

									<Editor
										editorState={this.state.editorState}
										handleKeyCommand={this.handleKeyCommand}
										onChange={this.onChange}
										handleBeforeInput={this._handleBeforeInput}
										handlePastedText={this._handlePastedText}
										plugins={plugins}
									/>

									<p>
										<CharCounter editorState={this.state.editorState} limit={200}/> characters
									</p>

									<p>
										{this.state.remainingChars} characters remaining, {this.state.messageCount} messages
									</p>


								</div>
							</div>
							<button onClick={this.submitEditor}>Submit Data</button>

						</Col>
					</Row>
				</div>
			</React.Fragment>

		);
	}
}

export default EditorPage;
