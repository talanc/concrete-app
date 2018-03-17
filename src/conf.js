import React, { Component, Fragment } from 'react';
import { Button, Form, Header, Input, Grid, Label,Popup, Table } from 'semantic-ui-react';
import { sqm } from './util';

function generateKey() {
  return Math.random().toString();
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
    concreteRates: [
      { key: generateKey(), limit: 10, rate: 101 },
      { key: generateKey(), limit: 20, rate: 95 },
      { key: generateKey(), limit: 40, rate: 90 },
      { key: generateKey(), limit: 60, rate: 80 },
      { key: generateKey(), limit: 120, rate: 70 },
      { key: generateKey(), limit: null, rate: 63 },
    ],
    slabThickness125: 10,
    meshThicknessSL82: 4.5,
    pumpOn: 950,
    pumpDouble: 1900,
    polyMembraneOn: 3.5,
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

    return (
      <Table.Row>
        <Table.Cell>
          <Input disabled={this.props.limit == null} defaultValue={this.props.limit} placeholder="..." onChange={this.handleLimitChange}
          />
        </Table.Cell>
        <Table.Cell>
          <Input label='$' defaultValue={this.props.rate} placeholder="..." onChange={this.handleRateChange} />
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

    this.state = props.configuration;

    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleExtraChange = this.handleExtraChange.bind(this);
  }

  handleSave() {
    this.props.onSave(this.state);
  }

  handleCancel() {
    this.props.onCancel();
  }

  handleAddRow(i) {
    const thisRow = this.state.concreteRates[i];
    const prevRow = this.state.concreteRates[i - 1];

    const key = generateKey();

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

    const concreteRates = this.state.concreteRates.slice();
    concreteRates.splice(i, 0, item);

    this.setState({
      concreteRates
    });
  }

  handleRemoveRow(i) {
    const concreteRates = this.state.concreteRates.slice();
    concreteRates.splice(i, 1);

    this.setState({
      concreteRates
    });
  }

  handleLimitChange(i, limit) {
    const concreteRates = this.state.concreteRates.slice();

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

    this.setState({
      concreteRates
    });
  }

  handleRateChange(i, rate) {
    const concreteRates = this.state.concreteRates.slice();

    var item = {
      ...concreteRates[i],
      rate
    };

    concreteRates.splice(i, 1, item);

    this.setState({
      concreteRates
    });
  }

  handleExtraChange(event, { name, value }) {
    value = parseFloat(value);
    if (isNaN(value)) {
      value = 0;
    }

    this.setState({
      [name]: value
    });
  }

  renderRow(i) {
    return (
      <ConcreteRateRow
        key={this.state.concreteRates[i].key}
        limit={this.state.concreteRates[i].limit}
        rate={this.state.concreteRates[i].rate}
        onAdd={() => this.handleAddRow(i)}
        onRemove={() => this.handleRemoveRow(i)}
        onLimitChange={(newLimit) => this.handleLimitChange(i, newLimit)}
        onRateChange={(newRate) => this.handleRateChange(i, newRate)}
      />
    );
  }

  renderConcreteRates() {
    const rows = this.state.concreteRates.map((value, i) => this.renderRow(i));

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
   * @param {'ea' | 'm2' | 'pct'} inputType 
   */
  renderExtra(name, displayName, inputType) {
    const value = this.state[name];

    let label1, label2;
    if (inputType === 'ea') {
      label1 = <Label>$</Label>;
    }
    else if (inputType === 'm2') {
      displayName = <Fragment>{displayName} (per m<sup>2</sup>)</Fragment>;
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
          <Input name={name} labelPosition={labelPosition} defaultValue={value} onChange={this.handleExtraChange}>
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
            {this.renderExtra("taxRate", "Tax Rate", "pct")}
          </Table.Body>
        </Table>
      </Fragment>
    )
  }

  render() {
    return (
      <Fragment>
        <Grid columns="2">
          <Grid.Column>
            {this.renderConcreteRates()}
          </Grid.Column>
          <Grid.Column>
            {this.renderExtras()}
          </Grid.Column>
        </Grid>
        <Form>
          <Form.Group>
            <Button positive onClick={this.handleSave}>Save</Button>
            <Button onClick={this.handleCancel}>Cancel</Button>
          </Form.Group>
        </Form>
      </Fragment>
    );
  }
}