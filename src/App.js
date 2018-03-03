import React, { Component, Fragment } from 'react';
import { Container, Divider, Form, Header, Grid, Message, Menu, Table } from 'semantic-ui-react';
//import logo from './logo.svg';
import './App.css';

const configuration = {
  concreteRates: [
    { limit: 10, rate: 101, display: <Fragment>Less than 10m<sup>2</sup></Fragment> },
    { limit: 20, rate: 95, display: <Fragment>10m<sup>2</sup> to 20m<sup>2</sup></Fragment> },
    { limit: 40, rate: 90, display: <Fragment>20m<sup>2</sup> to 40m<sup>2</sup></Fragment> },
    { limit: 60, rate: 80, display: <Fragment>40m<sup>2</sup> to 60m<sup>2</sup></Fragment> },
    { limit: 120, rate: 70, display: <Fragment>60m<sup>2</sup> to 120m<sup>2</sup></Fragment> },
    { limit: null, rate: 63, display: <Fragment>Over 120m<sup>2</sup></Fragment> },
  ],
  slabThickness125: 10,
  meshThicknessSL82: 4.5,
  pumpOn: 950,
  pumpDouble: 1900,
  polyMembraneOn: 3.5,
  taxRate: 0.1
};

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
      <Message negative>
        <Message.Header>{props.force.title}</Message.Header>
        {props.force.message}
      </Message>
    </Form.Group>
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 6,
      length: 9,
      slabThickness: slabThicknessOptions[0].value,
      meshThickness: meshThicknessOptions[0].value,
      meshThicknessForce: null,
      pump: pumpOptions[0].value,
      pumpForce: null,
      polyMembrane: polyMembraneOptions[0].value
    };

    this.handleInputChange = this.handleInputChange.bind(this);
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
          message: <p>{meshThicknessForceMessage}</p>
        };
      }

      let pumpForce = null;
      if (area > 350) {
        pumpForce = {
          value: pumpOption_Double.value,
          title: "Forced to Double",
          message: <p>Area > 350m<sup>2</sup></p>
        };
      }
      else if (area > 125) {
        pumpForce = {
          value: pumpOption_On.value,
          title: "Forced to On",
          message: <p>Area > 350m<sup>2</sup></p>
        };
      }

      return {
        meshThicknessForce: meshThicknessForce,
        pumpForce: pumpForce
      };
    });
  }

  getCurrentRate() {
    const area = this.getArea();

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

  getTotal() {

    let items = [];
    let total = 0;
    function add(item, cost) {
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

    const tax = total * configuration.taxRate;
    add("Tax", tax);

    return {
      items: items,
      total: total
    };
  }

  renderField(name, value, label) {
    return (
      <Form.Input name={name} type='text' value={value} label={label} onChange={this.handleInputChange} />
    );
  }

  renderSelect(name, value, label, options, force) {
    if (force) {
      value = force.value;
    }

    return (
      <Fragment>
        <Form.Group>
          <Form.Select name={name} label={label} options={options} value={value} onChange={this.handleInputChange} />
        </Form.Group>
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
    const area = this.state.width * this.state.length;
    const volume = area * (this.state.slabThickness / 1000);
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

  renderConfig() {
    const conf = configuration;

    const activeRate = this.getCurrentRate();

    const rates = conf.concreteRates.map(rate => {
      const active = (rate === activeRate);
      return (
        <Table.Row key={rate.rate} active={active}>
          <Table.Cell>{rate.display}</Table.Cell>
          <Table.Cell>{calculatePrice(rate.rate)}</Table.Cell>
        </Table.Row>
      );
    });

    return (
      <Fragment>
        <Header as='h2'>Configuration</Header>
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
                {this.renderConfigExtra("Slab Thickness 125mm", conf.slabThickness125, "m2", this.state.slabThickness === slabThickness_125.value)}
                {this.renderConfigExtra("Mesh Thickness SL82", conf.meshThicknessSL82, "m2", this.getMeshThickness() === meshThickness_SL82.value)}
                {this.renderConfigExtra("Poly Membrane", conf.polyMembraneOn, "m2", this.state.polyMembrane === polyMembrane_On.value)}
                {this.renderConfigExtra("Pump", conf.pumpOn, "ea", this.getPump() === pumpOption_On.value)}
                {this.renderConfigExtra("Pump (Double)", conf.pumpDouble, "ea", this.getPump() === pumpOption_Double.value)}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid>
      </Fragment>
    );
  }

  render() {
    return (
      <Fragment>
        <Menu fixed='top' inverted>
          <Container>
            <Menu.Item header>Concrete App</Menu.Item>
          </Container>
        </Menu>
        <Container style={{ marginTop: '4em' }}>
          <Grid columns='equal'>
            <Grid.Column>
              {this.renderConfig()}
            </Grid.Column>
          </Grid>
          <Divider />
          <Grid stackable columns='equal'>
            <Grid.Column>
              {this.renderInput()}
            </Grid.Column>
            <Grid.Column>
              {this.renderOutput()}
            </Grid.Column>
          </Grid>
        </Container>
      </Fragment>
    );
  }
}

export default App;
