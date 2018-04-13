import React, { Component, Fragment } from 'react';
import { Container, Divider, Form, Header, Image, Grid, Message, Menu, Table } from 'semantic-ui-react';
import { generateDefaultConfiguration, generateDisplay } from './conf';
import * as conf from './conf';
import * as storage from './storage';
import * as util from './util';
import logo from './logo.svg';
import Footer from './Footer';
import './App.css';

const slabThickness_100 = { key: '100', text: '100mm', value: 100 };
const slabThickness_125 = { key: '125', text: '125mm', value: 125 };

const slabThicknessOptions = [slabThickness_100, slabThickness_125];

const meshThickness_SL72 = { key: 'SL72', text: 'SL72', value: 'SL72' };
const meshThickness_SL82 = { key: 'SL82', text: 'SL82', value: 'SL82' };

const meshThicknessOptions = [meshThickness_SL72, meshThickness_SL82];

const pumpOption_Off = { key: 'off', text: "Off", value: 'off' };
const pumpOption_On = { key: 'on', text: "On", value: 'on' };
const pumpOption_Double = { key: 'double', text: "Double", value: 'double' };

const pumpOptions = [pumpOption_Off, pumpOption_On, pumpOption_Double];

const polyMembrane_Off = { key: 'off', text: "Off", value: 'off' };
const polyMembrane_On = { key: 'on', text: "On", value: 'on' };

const polyMembraneOptions = [polyMembrane_Off, polyMembrane_On];

function getDefaultAppState() {
  return {
    configuration: generateDefaultConfiguration(),
    width: 6,
    length: 9,
    slabThickness: slabThicknessOptions[0].value,
    meshThickness: meshThicknessOptions[0].value,
    meshThicknessForce: null,
    pump: pumpOptions[0].value,
    pumpForce: null,
    polyMembrane: polyMembraneOptions[0].value,
    rock: 0,
    rockForce: null,
    editConfiguration: false
  }
}

function calculateArea(width, length) {
  return width * length;
}

function calculatePrice(amount) {
  return "$" + amount.toFixed(2);
}

function FormForceMessage(props) {
  if (!props.force) {
    return null;
  }

  return (
    <Form.Group>
      <Message info compact size='small' style={{ padding: '0.5em 1em', marginTop: '0.25em', marginBottom: '1em' }}>
        <b>{props.force.title}:</b> {props.force.message}
      </Message>
    </Form.Group>
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    // load initial state
    this.state = getDefaultAppState();

    // load job + configuration
    const storedAppState = storage.getStoredAppState();
    if (storedAppState !== null) {
      this.state = storedAppState;
    }

    // load configuration from url
    if (storage.isShareUrl(window.location.href)) {
      try {
        this.state.configuration = storage.decodeConfiguration(window.location.href);
      }
      catch (error) {
        console.log('could not load from url bar, see details below');
        console.error(error);
      }
    }

    // update forces
    this.state = {
      ...this.state,
      ...this.getStateForces(this.state)
    };
  }

  handleConfigurationChange = (configuration) => {
    configuration = {
      ...configuration,
      isDefault: false
    };

    this.setState({
      configuration
    });

    this.saveAppState();
  }

  handleInputChange = (event, { name, value }) => {
    this.setState({
      [name]: value
    });

    this.setState(prevState => {
      const forces = this.getStateForces(prevState);
      return forces;
    });

    this.saveAppState();
  }

  saveAppState() {
    this.setState(prevState => {
      storage.setStoredAppState(prevState);
    });
  }

  getStateForces(prevState) {
    const area = calculateArea(prevState.width, prevState.length);

    let meshThicknessForceMessage;
    if (prevState.width > 12 && prevState.length) {
      meshThicknessForceMessage = "Width > 12m, Length > 12m";
    }
    else if (prevState.width > 12) {
      meshThicknessForceMessage = "Width > 12m";
    }
    else if (prevState.length > 12) {
      meshThicknessForceMessage = "Length > 12m";
    }

    let meshThicknessForce;
    if (meshThicknessForceMessage) {
      meshThicknessForce = {
        value: meshThickness_SL82.value,
        title: "Forced to SL82",
        message: <Fragment>{meshThicknessForceMessage}</Fragment>
      };
    }

    let pumpForce = null;
    if (area > 350) {
      pumpForce = {
        value: pumpOption_Double.value,
        title: "Forced to Double",
        message: <Fragment>Area > 350m<sup>2</sup></Fragment>
      };
    }
    else if (area > 125) {
      pumpForce = {
        value: pumpOption_On.value,
        title: "Forced to On",
        message: <Fragment>Area > 350m<sup>2</sup></Fragment>
      };
    }

    let rockValue, rockArea;
    if (area > 250) {
      rockValue = 30;
      rockArea = 250;
    }
    else if (area > 150) {
      rockValue = 20;
      rockArea = 150;
    }
    else if (area > 100) {
      rockValue = 10;
      rockArea = 100;
    }

    let rockForce;
    if (rockValue) {
      rockForce = {
        value: rockValue,
        title: "Forced Rock",
        message: <Fragment>Area > {util.sqm(rockArea)}</Fragment>
      };
    }

    return {
      meshThicknessForce: meshThicknessForce,
      pumpForce: pumpForce,
      rockForce
    };
  }

  getConfiguration() {
    return this.state.configuration;
  }

  findRate(limit, rates) {
    let rate = rates.find(rate => {
      return limit < rate.limit
    });
    if (rate == null) {
      rate = rates[rates.length - 1];
    }

    return rate;
  }

  getCurrentRate() {
    const area = this.getArea();
    const configuration = this.getConfiguration();

    return this.findRate(area, configuration.concreteRates);
  }

  getRockRate() {
    const configuration = this.getConfiguration();

    return this.findRate(this.getRock(), configuration.rock);
  }

  getMeshThickness() {
    return this.state.meshThicknessForce ? this.state.meshThicknessForce.value : this.state.meshThickness;
  }

  getPump() {
    return this.state.pumpForce ? this.state.pumpForce.value : this.state.pump;
  }

  getRock() {
    return this.state.rockForce ? this.state.rockForce.value : this.state.rock;
  }

  getArea() {
    return calculateArea(this.state.width, this.state.length);
  }

  getVolume() {
    return this.getArea() * (this.state.slabThickness / 1000);
  }

  getTotal() {
    const configuration = this.getConfiguration();
    const tax = configuration.taxRate / 100;

    let items = [];
    let total = 0;
    function add(item, cost) {
      cost = cost + cost * tax; // add tax to item
      items.push({ item: item, cost: cost });
      total += cost;
    }

    const area = this.getArea();

    const rate = this.getCurrentRate();
    add("Base Slab", area * rate.rate);

    if (this.state.slabThickness === slabThickness_125.value) {
      add("125mm Upgrade", area * configuration.slabThickness125);
    }

    if (this.getMeshThickness() === meshThickness_SL82.value) {
      add("SL82 Upgrade", area * configuration.meshThicknessSL82);
    }

    if (this.state.polyMembrane === polyMembrane_On.value) {
      add("Poly Membrane", area * configuration.polyMembraneOn);
    }

    const pump = this.getPump();
    if (pump === pumpOption_On.value) {
      add("Pump", configuration.pumpOn);
    }
    if (pump === pumpOption_Double.value) {
      add("Pump (Double)", configuration.pumpDouble);
    }

    const rock = this.getRock();
    if (rock > 0) {
      add("Rock", rock * this.getRockRate().rate);
    }

    return {
      items: items,
      total: total
    };
  }

  renderField(name, value, label, force) {
    if (force) {
      value = force.value;
    }

    return (
      <Fragment>
        <Form.Input name={name} required type='number' value={value} label={label} onChange={this.handleInputChange} />
        <FormForceMessage force={force} />
      </Fragment>
    );
  }

  renderSelect(name, value, label, options, force) {
    if (force) {
      value = force.value;
    }

    return (
      <Fragment>
        <Form.Select name={name} label={label} options={options} value={value} fluid onChange={this.handleInputChange} />
        <FormForceMessage force={force} />
      </Fragment>
    );
  }

  renderRadios(name, value, label, options, force) {
    if (force) {
      value = force.value;
    }

    const radios = options.map(curr => <Form.Radio key={curr.key} name={name} label={curr.text} value={curr.value} checked={value === curr.value} onChange={this.handleInputChange} />);

    return (
      <Fragment>
        <Form.Group inline>
          <label>{label}</label>
          {radios}
        </Form.Group>
        <FormForceMessage force={force} />
      </Fragment>
    );
  }

  renderInput() {
    return (
      <Fragment>
        <Header as='h2'>Input</Header>
        <Form>
          {this.renderField("width", this.state.width, 'Shed Width (m)', null)}
          {this.renderField("length", this.state.length, 'Shed Length (m)', null)}
          {this.renderSelect("slabThickness", this.state.slabThickness, 'Slab Thickness', slabThicknessOptions, null)}
          {this.renderSelect("meshThickness", this.state.meshThickness, 'Mesh Thickness', meshThicknessOptions, this.state.meshThicknessForce)}
          {this.renderRadios("pump", this.state.pump, 'Concrete Pump', pumpOptions, this.state.pumpForce)}
          {this.renderRadios("polyMembrane", this.state.polyMembrane, 'Poly Membrane', polyMembraneOptions, null)}
          {this.renderField("rock", this.state.rock, <label>Rock {util.per_m3}</label>, this.state.rockForce)}
        </Form>
      </Fragment>
    );
  }

  renderOutput() {
    const area = this.getArea();
    const volume = this.getVolume();
    const total = this.getTotal();

    const items = total.items.map(item => {
      return (
        <Table.Row key={item.item}>
          <Table.Cell textAlign='right'>{item.item}</Table.Cell>
          <Table.Cell>{calculatePrice(item.cost)}</Table.Cell>
        </Table.Row>
      );
    });

    return (
      <Fragment>
        <Header as='h2'>Output</Header>
        <p>Area = {area.toFixed(2)}m<sup>2</sup></p>
        <p>Volume = {volume.toFixed(2)}m<sup>3</sup></p>
        <Header as='h3'>Itemised Prices</Header>
        <Table unstackable celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Item</Table.HeaderCell>
              <Table.HeaderCell collapsing>Price</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell textAlign='right'><b>Total</b></Table.HeaderCell>
              <Table.HeaderCell textAlign='right'><b>{calculatePrice(total.total)}</b></Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Fragment>
    )
  }

  renderConfigExtra(name, value, unit, active) {
    if (unit === 'ea') {
      value = calculatePrice(value);
    }
    else if (unit === 'm2') {
      value = <Fragment>{calculatePrice(value)} {util.per_m2}</Fragment>;
    }
    else if (unit === 'm3') {
      value = <Fragment>{calculatePrice(value)} {util.per_m3}</Fragment>;
    }

    return (
      <Table.Row key={name} active={active}>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{value}</Table.Cell>
      </Table.Row>
    );
  }

  renderRatesTable(name, scale, rates, activeRate) {
    const displays = generateDisplay(rates, scale);

    const displayRates = rates.map((rate, i) => {
      const display = displays[i];
      const active = (rate === activeRate);

      return (
        <Table.Row key={rate.key} active={active}>
          <Table.Cell>{display}</Table.Cell>
          <Table.Cell>{calculatePrice(rate.rate)}</Table.Cell>
        </Table.Row>
      );
    });

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{name}</Table.HeaderCell>
            <Table.HeaderCell>Rate per {scale}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {displayRates}
        </Table.Body>
      </Table>
    );
  }

  renderConfigInfo() {
    const configuration = this.getConfiguration();

    return (
      <Fragment>
        <Grid columns='equal'>
          <Grid.Column>
            <Header as='h4'>Concrete Rates</Header>
            {this.renderRatesTable('Concrete', util.m2, configuration.concreteRates, this.getCurrentRate())}
            <Header as='h4'>Rock Rates</Header>
            {this.renderRatesTable('Rock', util.m3, configuration.rock, this.getRockRate())}
          </Grid.Column>
          <Grid.Column>
            <Header as='h4'>Extras</Header>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.renderConfigExtra("Slab Thickness 125mm", configuration.slabThickness125, "m2", this.state.slabThickness === slabThickness_125.value)}
                {this.renderConfigExtra("Mesh Thickness SL82", configuration.meshThicknessSL82, "m2", this.getMeshThickness() === meshThickness_SL82.value)}
                {this.renderConfigExtra("Poly Membrane", configuration.polyMembraneOn, "m2", this.state.polyMembrane === polyMembrane_On.value)}
                {this.renderConfigExtra("Pump", configuration.pumpOn, "ea", this.getPump() === pumpOption_On.value)}
                {this.renderConfigExtra("Pump (Double)", configuration.pumpDouble, "ea", this.getPump() === pumpOption_Double.value)}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid>
      </Fragment>
    );
  }

  renderConfigDefaultWarning() {
    return (
      <Message
        warning
        icon='warning sign'
        header='Default Configuration'
        content="You're using the Default Configuration. Please create or load configuration before considering the Output."
      />
    );
  }

  renderConfig() {
    const configuration = this.getConfiguration();
    const warning = (configuration.isDefault ? this.renderConfigDefaultWarning() : null);

    return (
      <Fragment>
        <Header as='h2'>Configuration: {configuration.name}</Header>
        {warning}
        <Form>
          <Form.Group>
            <conf.ConfigurationEditorModal mode='create' configuration={configuration} onSubmit={this.handleConfigurationChange} />
            <conf.LoadConfigurationModal decode={storage.decodeConfiguration} onSubmit={this.handleConfigurationChange} />
            <conf.ShareConfigurationModal shareUrl={storage.getShareConfigurationUrl(configuration)} disabled={configuration.isDefault} />
          </Form.Group>
        </Form>
        {this.renderConfigInfo()}
      </Fragment>
    );
  }

  render() {
    return (
      <Fragment>
        <Menu inverted borderless style={{ borderRadius: '0' }}>
          <Container>
            <Menu.Item header>
              <Image size='mini' src={logo} style={{ marginRight: '0.5em' }} />
              Concrete App
            </Menu.Item>
          </Container>
        </Menu>
        <Container>
          <Grid centered>
            <Grid.Row>
              <Grid.Column mobile={16} tablet={8} computer={5}>
                {this.renderInput()}
                <Divider />
                {this.renderOutput()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider />
          {this.renderConfig()}
        </Container>
        <Footer />
      </Fragment>
    );
  }
}

export default App;
