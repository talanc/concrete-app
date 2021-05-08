import React, { Component, Fragment } from 'react';
import { Button, Form, Header, Input, Grid, Label, Modal, Table } from 'semantic-ui-react';
import { machineHireOptions } from './opts';
import * as util from './util';
import RatesEditor from './components/RatesEditor';
import './conf.css';

export function generateDisplay(rates, displayValue) {
  let old = null;

  return rates.map(value => {
    const prev = old;
    old = value;

    if (rates.length === 1) {
      return <Fragment>Any amount</Fragment>;
    }

    if (prev === null) {
      return <Fragment>Less than {value.limit}{displayValue}</Fragment>;
    }

    if (value.limit === null) {
      return <Fragment>Over {prev.limit}{displayValue}</Fragment>;
    }

    return <Fragment>{prev.limit}{displayValue} to {value.limit}{displayValue}</Fragment>;
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
    machineHireOn: machineHireOptions.defaultPrice,
    rock: [
      { key: 0, limit: 100, rate: 10 },
      { key: 1, limit: null, rate: 5 }
    ],
    taxRate: 10
  };
}

export class EditConfigurationPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      configuration: props.configuration,
      secret: null
    };
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

  handleSecretChange = (secret) => {
    this.setState({
      secret: secret
    });
  }

  handleNameChange = (event, { name, value }) => {
    this.updateConfiguration({
      [name]: value
    });
  }

  handleExtraChange = (event, { name, value }) => {
    value = parseFloat(value);
    if (isNaN(value)) {
      value = 0;
    }

    this.updateConfiguration({
      [name]: value
    });
  }

  handleConcreteRateChange = (rates) => {
    this.updateConfiguration({
      concreteRates: rates
    });
  }

  handleRockChange = (rates) => {
    this.updateConfiguration({
      rock: rates
    });
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
          <Input name={name} type='number' labelPosition={labelPosition} value={value} onChange={this.handleExtraChange}>
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
            {this.renderExtra("machineHireOn", machineHireOptions.label, "ea")}
            {this.renderExtra("pumpOn", "Pump", "ea")}
            {this.renderExtra("pumpDouble", "Pump (Double)", "ea")}
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
        <Header as='h4'>Configuration Name</Header>
        <Input name='name' type='text' placeholder='Configuration Name' value={configuration.name} onChange={this.handleNameChange} />
        <div className='fix-grid-margins' style={{ marginTop: '1rem' }}>
          <Grid columns='2' stackable>
            <Grid.Column>
              <Header as='h4'>Concrete Rates</Header>
              <RatesEditor name1='Concrete' name2={<Fragment>Rate per m<sup>2</sup></Fragment>}
                rates={configuration.concreteRates} onChange={this.handleConcreteRateChange} />
              <Header as='h4'>Rock Rates</Header>
              <RatesEditor name1='Rock' name2={<Fragment>Rate per {util.per_m3}</Fragment>}
                rates={configuration.rock} onChange={this.handleRockChange}
              />
            </Grid.Column>
            <Grid.Column>
              {this.renderExtras()}
            </Grid.Column>
          </Grid>
        </div>
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
