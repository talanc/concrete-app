import React, { Component, Fragment } from 'react';
import { Button, Form, Header, Input, Grid, Label, Modal, Popup, Table } from 'semantic-ui-react';
import { sqm } from './util';
import * as util from './util';

function generateKey(arr) {
  const fn = (curr) => curr.key === key;

  let key = arr.length;
  while (true) {
    if (arr.filter(fn).length === 0)
      return key;
    key++;
  }
}

export function generateDisplay(rates) {
  let old = null;

  return rates.map(value => {
    const prev = old;
    old = value;

    if (prev === null) {
      return <Fragment>Less than {sqm(value.limit)}</Fragment>;
    }

    if (value.limit === null) {
      return <Fragment>Over {sqm(prev.limit)}</Fragment>;
    }

    return <Fragment>{sqm(prev.limit)} to {sqm(value.limit)}</Fragment>;
  });
}

export function generateDefaultConfiguration() {
  return {
    id: null,
    isDefault: true,
    name: "Default",
    concreteRates: [
      { key: 0, limit: 10, rate: 20 },
      { key: 1, limit: 20, rate: 18 },
      { key: 2, limit: 40, rate: 15 },
      { key: 3, limit: 60, rate: 10 },
      { key: 4, limit: 120, rate: 8 },
      { key: 5, limit: null, rate: 5 },
    ],
    slabThickness125: 1,
    meshThicknessSL82: 2,
    pumpOn: 25,
    pumpDouble: 50,
    polyMembraneOn: 2,
    rock: 5,
    taxRate: 10
  };
}

class ConcreteRateRow extends Component {
  constructor(props) {
    super(props);

    this.handleLimitChange = this.handleLimitChange.bind(this);
    this.handleRateChange = this.handleRateChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleLimitChange(event, { value }) {
    var limit = parseFloat(value);
    if (!isNaN(limit)) {
      this.props.onLimitChange(limit);
    }
  }

  handleRateChange(event, { value }) {
    var rate = parseFloat(value);
    if (!isNaN(rate)) {
      this.props.onRateChange(rate);
    }
  }

  handleAdd() {
    this.props.onAdd();
  }

  handleRemove() {
    this.props.onRemove();
  }

  render() {
    const buttonAdd = <Button icon='add' onClick={this.handleAdd} />;
    const buttonRemove = <Button disabled={this.props.limit == null} icon='minus' onClick={this.handleRemove} />;

    let limit;
    if (this.props.limit) {
      limit = this.props.limit;
    }
    else if (this.props.prevLimit) {
      limit = `More than ${this.props.prevLimit}`;
    }

    return (
      <Table.Row>
        <Table.Cell>
          <Input disabled={this.props.limit == null} value={limit} placeholder="..." onChange={this.handleLimitChange} />
        </Table.Cell>
        <Table.Cell>
          <Input label='$' value={this.props.rate} placeholder="..." onChange={this.handleRateChange} />
        </Table.Cell>
        <Table.Cell>
          <Button.Group>
            <Popup trigger={buttonAdd} content="Insert a new line above" />
            <Popup trigger={buttonRemove} content="Remove this line" />
          </Button.Group>
        </Table.Cell>
      </Table.Row>
    );
  }
}

export class EditConfigurationPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      configuration: props.configuration,
      secret: null
    };

    this.handleSecretChange = this.handleSecretChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleExtraChange = this.handleExtraChange.bind(this);
  }

  getConfiguration() {
    return this.state.configuration;
  }

  updateConfiguration(newObj) {
    const configuration = {
      ...this.getConfiguration(),
      ...newObj
    };

    this.setState({ configuration: configuration });

    this.props.onConfigurationChanged(configuration);
  }

  handleSecretChange(secret) {
    this.setState({
      secret: secret
    });
  }

  setConcreteRates(concreteRates) {
    this.updateConfiguration({
      concreteRates: concreteRates
    });
  }

  handleNameChange(event, { name, value }) {
    this.updateConfiguration({
      [name]: value
    });
  }

  handleExtraChange(event, { name, value }) {
    value = parseFloat(value);
    if (isNaN(value)) {
      value = 0;
    }

    this.updateConfiguration({
      [name]: value
    });
  }

  handleAddRow(i) {
    const configuration = this.getConfiguration();
    const thisRow = configuration.concreteRates[i];
    const prevRow = configuration.concreteRates[i - 1];

    const key = generateKey(configuration.concreteRates);

    let limit;
    if (thisRow.limit === null) {
      if (prevRow) {
        limit = prevRow.limit * 2;
      }
      else {
        limit = 10;
      }
    }
    else if (prevRow) {
      limit = (thisRow.limit + prevRow.limit) / 2;
    }
    else {
      limit = thisRow.limit / 2;
    }
    limit = Math.round(limit);

    let rate;
    if (prevRow) {
      rate = Math.round((thisRow.rate + prevRow.rate) / 2);
    }
    else {
      rate = Math.round(thisRow.rate * 1.5);
    }
    rate = Math.round(rate);

    const item = { key, limit, rate };

    const concreteRates = configuration.concreteRates.slice();
    concreteRates.splice(i, 0, item);

    this.setConcreteRates(concreteRates);
  }

  handleRemoveRow(i) {
    const configuration = this.getConfiguration();
    const concreteRates = configuration.concreteRates.slice();
    concreteRates.splice(i, 1);

    this.setConcreteRates(concreteRates);
  }

  handleLimitChange(i, limit) {
    const configuration = this.getConfiguration();
    const concreteRates = configuration.concreteRates.slice();

    var item = {
      ...concreteRates[i],
      limit
    };

    concreteRates.splice(i, 1);

    var newIdx = concreteRates.length - 1;
    while (newIdx > 0 && limit < concreteRates[newIdx - 1].limit) {
      newIdx--;
    }

    concreteRates.splice(newIdx, 0, item);

    this.setConcreteRates(concreteRates);
  }

  handleRateChange(i, rate) {
    const configuration = this.getConfiguration();
    const concreteRates = configuration.concreteRates.slice();

    var item = {
      ...concreteRates[i],
      rate
    };

    concreteRates.splice(i, 1, item);

    this.setConcreteRates(concreteRates);
  }

  renderRow(i) {
    const configuration = this.getConfiguration();
    const prevLimit = (i > 0 ? configuration.concreteRates[i - 1].limit : null);

    return (
      <ConcreteRateRow
        key={configuration.concreteRates[i].key}
        limit={configuration.concreteRates[i].limit}
        rate={configuration.concreteRates[i].rate}
        prevLimit={prevLimit}
        onAdd={() => this.handleAddRow(i)}
        onRemove={() => this.handleRemoveRow(i)}
        onLimitChange={(newLimit) => this.handleLimitChange(i, newLimit)}
        onRateChange={(newRate) => this.handleRateChange(i, newRate)}
      />
    );
  }

  renderConcreteRates() {
    const configuration = this.getConfiguration();
    const rows = configuration.concreteRates.map((value, i) => this.renderRow(i));

    return (
      <Fragment>
        <Header as='h4'>Concrete Rates</Header>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Concrete</Table.HeaderCell>
              <Table.HeaderCell>Rate per m<sup>2</sup></Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
      </Fragment>
    )
  }

  /**
   * @param {string} name 
   * @param {string} displayName 
   * @param {'ea' | 'm2' | 'm3' | 'pct'} inputType 
   */
  renderExtra(name, displayName, inputType) {
    const configuration = this.getConfiguration();
    const value = configuration[name];

    let label1, label2;
    if (inputType === 'ea') {
      label1 = <Label>$</Label>;
    }
    else if (inputType === 'm2') {
      displayName = <Fragment>{displayName} ({util.per_m2})</Fragment>;
      label1 = <Label>$</Label>;
    }
    else if (inputType === 'm3') {
      displayName = <Fragment>{displayName} ({util.per_m3})</Fragment>;
      label1 = <Label>$</Label>;
    }
    else { // pct
      label2 = <Label>%</Label>;
    }

    const labelPosition = (label2 ? 'right' : 'left');

    return (
      <Table.Row>
        <Table.Cell>
          {displayName}
        </Table.Cell>
        <Table.Cell>
          <Input name={name} labelPosition={labelPosition} value={value} onChange={this.handleExtraChange}>
            {label1}
            <input />
            {label2}
          </Input>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderExtras() {
    return (
      <Fragment>
        <Header as='h4'>Extras</Header>
        <Table style={{ marginBottom: '1rem' }}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.renderExtra("slabThickness125", "Slab Thickness 125mm", "m2")}
            {this.renderExtra("meshThicknessSL82", "Mesh Thickness SL82", "m2")}
            {this.renderExtra("polyMembraneOn", "Poly Membrane", "m2")}
            {this.renderExtra("pumpOn", "Pump", "ea")}
            {this.renderExtra("pumpDouble", "Pump (Double)", "ea")}
            {this.renderExtra("rock", "Rock", "m3")}
            {this.renderExtra("taxRate", "Tax Rate", "pct")}
          </Table.Body>
        </Table>
      </Fragment>
    )
  }

  render() {
    const configuration = this.getConfiguration();

    return (
      <Fragment>
        <Form>
          <Form.Group>
            <Form.Input name='name' label='Configuration Name' type='text' placeholder='Configuration Name' value={configuration.name} onChange={this.handleNameChange} />
          </Form.Group>
        </Form>
        <Grid columns="2" stackable>
          <Grid.Column>
            {this.renderConcreteRates()}
          </Grid.Column>
          <Grid.Column>
            {this.renderExtras()}
          </Grid.Column>
        </Grid>
      </Fragment>
    );
  }
}

export class ConfigurationEditorModal extends Component {
  constructor(props) {
    super(props);

    this.state = this.getDefaultState();

    this.isEditMode = (props.mode === 'edit');
    this.isCreateMode = (props.mode === 'create');
  }

  getDefaultState() {
    return {
      open: false,
      configuration: this.props.configuration,
      secret: this.props.secret
    };
  }

  open = () => {
    const defaultState = this.getDefaultState();

    this.setState({
      ...defaultState,
      open: true
    });
  }

  close = () => {
    this.setState({
      open: false
    });
  }

  handleConfigurationChange = (configuration) => {
    this.setState({ configuration });
  }

  submit = () => {
    this.props.onSubmit(this.state.configuration);
    this.close();
  }

  render() {
    const triggerText = (this.isEditMode ? "Edit Configuration" : "New Configuration");
    const trigger = <Button>{triggerText}</Button>;

    const primaryText = (this.isEditMode ? "Save Changes" : "Create");

    return (
      <Modal open={this.state.open} onOpen={this.open} onClose={this.close} trigger={trigger} size='fullscreen'>
        <Modal.Header>{triggerText}</Modal.Header>
        <Modal.Content>
          <EditConfigurationPanel configuration={this.state.configuration} onConfigurationChanged={this.handleConfigurationChange} />
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.submit}>{primaryText}</Button>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export class LoadConfigurationModal extends Component {
  constructor(props) {
    super(props);

    this.state = this.getDefaultState(false);
  }

  getDefaultState(open) {
    return {
      open: open,
      id: null,
      configuration: null,
      searching: false,
      error: null
    };
  }

  open = () => {
    const defaultState = this.getDefaultState(true);

    this.setState({
      ...defaultState
    });
  }

  close = () => {
    this.setState({
      open: false
    });
  }

  handleChange = (event, { name, value }) => {
    this.setState({
      [name]: value
    });
  }

  handleLoad = () => {
    this.setState({
      searching: true,
      configuration: null
    });

    let configuration = null;
    try {
      configuration = this.props.decode(this.state.id);
    }
    catch (ex) {
      this.setState({
        error: ex.toString()
      });
    }

    this.setState({
      searching: false,
      configuration
    });
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state.configuration);
    this.close();
  }

  renderLoading() {
    if (!this.state.searching) {
      return null;
    }

    return (
      <p>Searching...</p>
    );
  }

  renderError() {
    if (this.state.error === null) {
      return null;
    }

    return (
      <p>Error: <b>{this.state.error}</b></p>
    );
  }

  renderLoaded() {
    if (this.state.configuration === null) {
      return null;
    }

    return (
      <p>Configuration Loaded: <b>{this.state.configuration.name}</b></p>
    );
  }

  render() {
    const trigger = <Button>Load Configuration</Button>;
    const disabledLoad = this.state.configuration === null;

    return (
      <Modal open={this.state.open} onOpen={this.open} onClose={this.close} trigger={trigger}>
        <Modal.Header>Load Configuration</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Share URL</label>
              <Input name="id" type='text' placeholder='Enter Share URL' onChange={this.handleChange} />
            </Form.Field>
            <Button onClick={this.handleLoad}>Search</Button>
            {this.renderLoading()}
            {this.renderError()}
            {this.renderLoaded()}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleSubmit} disabled={disabledLoad}>Load</Button>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export class ShareConfigurationModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  open = () => {
    this.setState({
      open: true
    });
  }

  close = () => {
    this.setState({
      open: false
    });
  }

  render() {
    return (
      <Modal open={this.state.open} onOpen={this.open} onClose={this.close} trigger={<Button disabled={this.props.disabled}>Share Configuration</Button>}>
        <Modal.Header>Share Configuration</Modal.Header>
        <Modal.Content>
          <p>You can share this configuration via:</p>
          <p><a style={{ overflowWrap: 'break-word' }} href={this.props.shareUrl}>{this.props.shareUrl}</a></p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.close}>OK</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
