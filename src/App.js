import React, { Component, Fragment } from 'react';
import { Button, Container, Divider, Form, Header, Image, Grid, Message, Menu, Table } from 'semantic-ui-react';
import { generateDefaultConfiguration, generateDisplay , EditConfigurationPanel } from './conf';
import logo from './logo.svg';
import './App.css';

const slabThickness_100 = { key: '100', text: '100mm', value: 100 };
const slabThickness_125 = { key: '125', text: '125mm', value: 125 };

const slabThicknessOptions = [
  slabThickness_100,
  slabThickness_125
];

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

    this.state = {
      configuration: generateDefaultConfiguration(),
      width: 6,
      length: 9,
      slabThickness: slabThicknessOptions[0].value,
      meshThickness: meshThicknessOptions[0].value,
      meshThicknessForce: null,
      pump: pumpOptions[0].value,
      pumpForce: null,
      polyMembrane: polyMembraneOptions[0].value,
      editConfiguration: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleConfigurationSave = this.handleConfigurationSave.bind(this);
    this.handleConfigurationShow = this.handleConfigurationShow.bind(this);
    this.handleConfigurationCancel = this.handleConfigurationCancel.bind(this);
  }

  handleConfigurationShow() {
    this.setState({
      editConfiguration: true
    });
  }

  handleConfigurationSave(configuration) {
    this.setState({
      editConfiguration: false,
      configuration
    });
  }

  handleConfigurationCancel() {
    this.setState({
      editConfiguration: false
    });
  }

  handleInputChange(event, { name, value }) {
    this.setState({
      [name]: value
    });

    this.setState((prevState, props) => {
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

      return {
        meshThicknessForce: meshThicknessForce,
        pumpForce: pumpForce
      };
    });
  }

  getConfiguration() {
    return this.state.configuration;
  }

  getCurrentRate() {
    const area = this.getArea();
    const configuration = this.getConfiguration();

    let rate = configuration.concreteRates.find(rate => {
      return area < rate.limit
    });
    if (rate == null) {
      rate = configuration.concreteRates[configuration.concreteRates.length - 1];
    }

    return rate;
  }

  getMeshThickness() {
    return this.state.meshThicknessForce ? this.state.meshThicknessForce.value : this.state.meshThickness;
  }

  getPump() {
    return this.state.pumpForce ? this.state.pumpForce.value : this.state.pump;
  }

  getArea() {
    return calculateArea(this.state.width, this.state.length);
  }

  getVolume() {
    return this.getArea() * (this.state.slabThickness / 1000);
  }

  getTotal() {
    let items = [];
    let total = 0;
    function add(item, cost) {
      items.push({ item: item, cost: cost });
      total += cost;
    }

    const area = this.getArea();

    const configuration = this.getConfiguration();

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

    const tax = total * (configuration.taxRate / 100);
    add("Tax", tax);

    return {
      items: items,
      total: total
    };
  }

  renderField(name, value, label) {
    return (
      <Form.Input name={name} required type='number' value={value} label={label} onChange={this.handleInputChange} />
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
          {this.renderField("width", this.state.width, 'Shed Width (m)')}
          {this.renderField("length", this.state.length, 'Shed Length (m)')}
          {this.renderSelect("slabThickness", this.state.slabThickness, 'Slab Thickness', slabThicknessOptions, null)}
          {this.renderSelect("meshThickness", this.state.meshThickness, 'Mesh Thickness', meshThicknessOptions, this.state.meshThicknessForce)}
          {this.renderRadios("pump", this.state.pump, 'Concrete Pump', pumpOptions, this.state.pumpForce)}
          {this.renderRadios("polyMembrane", this.state.polyMembrane, 'Poly Membrane', polyMembraneOptions, null)}
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
      value = <p>{calculatePrice(value)} per m<sup>2</sup></p>;
    }

    return (
      <Table.Row key={name} active={active}>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{value}</Table.Cell>
      </Table.Row>
    );
  }

  renderEditConfig() {
    return (
      <EditConfigurationPanel
        configuration={this.state.configuration}
        onSave={this.handleConfigurationSave}
        onCancel={this.handleConfigurationCancel}
      />
    );
  }

  renderShowConfig() {
    const configuration = this.getConfiguration();
    const activeRate = this.getCurrentRate();
    const displays = generateDisplay(configuration.concreteRates);

    const rates = configuration.concreteRates.map((rate, i) => {
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
      <Fragment>
        <Form>
          <Form.Group>
            <Button onClick={this.handleConfigurationShow}>Edit Configuration</Button>
          </Form.Group>
        </Form>
        <Grid columns='equal'>
          <Grid.Column>
            <Header as='h4'>Concrete Rates</Header>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Concrete</Table.HeaderCell>
                  <Table.HeaderCell>Rate per m<sup>2</sup></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rates}
              </Table.Body>
            </Table>
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

  renderConfig() {
    const panel = (this.state.editConfiguration ? this.renderEditConfig() : this.renderShowConfig());

    return (
      <Fragment>
        <Header as='h2'>Configuration</Header>
        {panel}
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
          <Grid stackable columns='equal'>
            <Grid.Column>
              {this.renderInput()}
            </Grid.Column>
            <Grid.Column>
              {this.renderOutput()}
            </Grid.Column>
          </Grid>
          <Divider />
          <Grid columns='equal'>
            <Grid.Column>
              {this.renderConfig()}
            </Grid.Column>
          </Grid>
        </Container>
      </Fragment>
    );
  }
}

export default App;
