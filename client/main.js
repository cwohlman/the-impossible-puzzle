import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.puzzle.onCreated(function helloOnCreated() {
  this.pairs = new ReactiveVar();
  this.eliminated = new ReactiveVar();
  this.tickTock = new ReactiveVar();
  this.rounds = new ReactiveVar();


  this.next = function () {
    if (this.tickTock.get() === "product") {
      this.eliminateOnes("product");
      this.countMatches("sum");
      this.tickTock.set("sum");
    } else {
      this.eliminateOnes("sum");
      this.countMatches("product");
      this.tickTock.set("product");
      this.rounds.set(this.rounds.get() + 1);
    }
  };
  this.countMatches = function(field) {
    let pairs = this.pairs.get();

    _.each(pairs, (pair) => {
      pair[`count_${field}`] = _.filter(pairs, (other) => {
        return other[field] == pair[field];
      }).length;
    });

    this.pairs.set(pairs);
  };

  this.eliminateOnes = function(field) {
    let pairs = this.pairs.get();
    let eliminated = this.eliminated.get();

    let result = _.groupBy(pairs, (pair) => {
      return pair[`count_${field}`] > 1;
    });
    eliminated.push(result.false);

    this.pairs.set(result.true);
    this.eliminated.set(eliminated);
  }
  this.initialize = function () {
    let pairs = [];

    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= i; j++) {
        pairs.push({
          i: i,
          j: j,
          sum: i + j,
          product: i * j,
        });
      }
    }

    this.rounds.set(1);
    this.eliminated.set([]);
    this.pairs.set(pairs);
    this.countMatches("product");
    this.tickTock.set("product");
  }

  this.initialize();
});

function solution() {
    let pairs = [];

    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= i; j++) {
        pairs.push({
          i: i,
          j: j,
          sum: i + j,
          product: i * j,
        });
      }
    }

    let results = [];
    let rounds = 0;
    while (rounds < 5) {
      countMatches("product");
      eliminateOnes("product");
      countMatches("sum");
      eliminateOnes("sum");
      rounds++;
    }

    return results;

    function countMatches(field) {
      _.each(pairs, (pair) => {
        pair[`count_${field}`] = _.filter(pairs, (other) => {
          return other[field] == pair[field];
        }).length;
      });
    }
    function eliminateOnes(field) {
      let { true: p, false: eliminated } = _.groupBy(pairs, (pair) => {
        return pair[`count_${field}`] > 1;
      });
      results.push(eliminated);
      pairs = p;
    }
}

Template.puzzle.helpers({
  results() {
    return solution();
  },
  algorithm() {
    return (solution + '');
  },
  columns() {
    return _.map(_.range(1, 10), i => ({ i }));
  },
  rows() {
    return _.map(_.range(1, 10), j => ({ j }));
  },
  cell(column, row) {
    let instance = Template.instance()
    let pairs = instance.pairs.get();
    let pair = _.findWhere(pairs, { i: column.i, j: row.j });

    if (pair) {
      let tickTock = instance.tickTock.get();
      return pair[tickTock];
    }
  },
  classFor(column, row) {
    let instance = Template.instance()
    let pairs = instance.pairs.get();
    let pair = _.findWhere(pairs, { i: column.i, j: row.j });

    if (pair) {
      let tickTock = instance.tickTock.get();
      return pair[`count_${tickTock}`] === 1 ? 'to_eliminate' : '';
    }
  },
  whosTurn() {
    let instance = Template.instance();
    let tickTock = instance.tickTock.get();

    if (tickTock === "product") {
      return "Peter";
    }
    return "Susan";
  },
  he() {
    let instance = Template.instance();
    let tickTock = instance.tickTock.get();

    if (tickTock === "product") {
      return "he";
    }
    return "she";
  },
  product() {
    let instance = Template.instance();
    let tickTock = instance.tickTock.get();

    if (tickTock === "product") {
      return "product";
    }
    return "sum";
  },
  round() {
    let instance = Template.instance();

    return instance.rounds.get();
  }
});

Template.puzzle.events({
  'click [data-action="next"]'(event, instance) {
    instance.next();
  },
  'click [data-action="restart"]'(event, instance) {
    instance.initialize();
  },
});
