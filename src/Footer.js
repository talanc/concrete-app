import React from 'react';
import { Container, Header, List, Segment } from 'semantic-ui-react';

export function Footer(props) {
  return (
    <Segment inverted vertical style={{ margin: '2em 0em 0em', padding: '2em 0em' }}>
      <Container>
        <Header inverted as='h4' content='Help' />
        <List link inverted>
          <List.Item as='a' target="_blank" rel="noopener noreferrer" href='https://github.com/talanc/concrete-app/blob/master/docs/sharing-configurations.md'>Sharing Configurations</List.Item>
          <List.Item as='a' target="_blank" rel="noopener noreferrer" href='https://github.com/talanc/concrete-app'>Source</List.Item>
        </List>
      </Container>
    </Segment>
  );
}

export default Footer;