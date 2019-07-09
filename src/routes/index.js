import React, {Component} from 'react';
import {Layout, Menu} from "antd"

import {Link, Route, Switch, Redirect} from "react-router-dom";

import Editor from './Editor'

class Index extends Component {

    render() {
        const {Header, Content, Footer} = Layout;


		const {match, history} = this.props;

		const selectedKeys = history.location.pathname.substr(1);
		const defaultOpenKeys = selectedKeys.split('/')[1];


        return (
            <Layout className="layout">
                <Header>
                    <div className="logo"/>
                    <Menu
                        theme="dark"
						defaultOpenKeys={[defaultOpenKeys]}
						selectedKeys={[selectedKeys]}
                        mode="horizontal"
                        style={{lineHeight: '64px'}}
                    >
						<Menu.Item key="editor">
							<Link to="/editor">Editor</Link>
						</Menu.Item>
                    </Menu>
                </Header>
                <Content style={{padding: '0 50px'}}>
					<Switch>
						<Route path={`${match.url}editor`} breadcrumbName="Editor" component={Editor}/>
					</Switch>
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    Work of ochomoswill using Ant Design.
                </Footer>
            </Layout>
        );
    }
}

export default Index;
