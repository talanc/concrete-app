import React, { Component } from 'react';
import { Button, Input, Popup, Table } from 'semantic-ui-react';
import { generateKey } from '../util'

class RateRow extends Component {
  handleLimitChange = (event, { value }) => {
    var limit = parseFloat(value);
    if (!isNaN(limit)) {
      this.props.onLimitChange(limit);
    }
  }

  handleRateChange = (event, { value }) => {
    var rate = parseFloat(value);
    if (!isNaN(rate)) {
      this.props.onRateChange(rate);
    }
  }

  handleAdd = () => {
    this.props.onAdd();
  }

  handleRemove = () => {
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
          <Input type='number' disabled={this.props.limit == null} value={limit} placeholder="..." onChange={this.handleLimitChange} />
        </Table.Cell>
        <Table.Cell>
          <Input type='number' label='$' value={this.props.rate} placeholder="..." onChange={this.handleRateChange} />
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

export default class RatesEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rates: props.rates
    };
  }

  setRates(rates) {
    this.setState({
      rates
    });
    this.props.onChange(rates);
  }

  handleAddRow(i) {
    const thisRow = this.state.rates[i];
    const prevRow = this.state.rates[i - 1];

    const key = generateKey(this.state.rates);

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

    const rates = this.state.rates.slice();
    rates.splice(i, 0, item);

    this.setRates(rates);
  }

  handleRemoveRow(i) {
    const rates = this.state.rates.slice();

    rates.splice(i, 1);

    this.setRates(rates);
  }

  handleLimitChange(i, limit) {
    const rates = this.state.rates.slice();

    var item = {
      ...rates[i],
      limit
    };

    rates.splice(i, 1);

    var newIdx = rates.length - 1;
    while (newIdx > 0 && limit < rates[newIdx - 1].limit) {
      newIdx--;
    }

    rates.splice(newIdx, 0, item);

    this.setRates(rates);
  }

  handleRateChange(i, rate) {
    const rates = this.state.rates.slice();

    var item = {
      ...rates[i],
      rate
    };

    rates.splice(i, 1, item);

    this.setRates(rates);
  }

  renderRow(i) {
    const rates = this.state.rates;
    const prevLimit = (i > 0 ? rates[i - 1].limit : null);

    return (
      <RateRow
        key={rates[i].key}
        limit={rates[i].limit}
        rate={rates[i].rate}
        prevLimit={prevLimit}
        onAdd={() => this.handleAddRow(i)}
        onRemove={() => this.handleRemoveRow(i)}
        onLimitChange={(newLimit) => this.handleLimitChange(i, newLimit)}
        onRateChange={(newRate) => this.handleRateChange(i, newRate)}
      />
    );
  }

  render() {
    const rows = this.state.rates.map((value, i) => this.renderRow(i));

    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{this.props.name1}</Table.HeaderCell>
            <Table.HeaderCell>{this.props.name2}</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
      </Table>
    )
  }
}
