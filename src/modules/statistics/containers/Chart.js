/*global AmCharts :true*/
import React, { Component, PropTypes } from 'react';
import 'amcharts3';
import 'amcharts3/amcharts/serial';
import 'amcharts3/amcharts/pie';
import 'amcharts3/amcharts/themes/light';
import 'ammap3';
import 'ammap3/ammap/themes/light.js';
import { connect } from 'react-redux';
import ukraineLow from './../components/UkraineMap';
import { STATISTICS_MAP as map } from './../constants';
import { loadStatistics } from '../actions';
import { fillMapWithData } from '../helpers';

class Chart extends Component {
  static propTypes = {
    children: PropTypes.any,
    dispatch: PropTypes.func,
    config: PropTypes.object.isRequired,
    chartId: PropTypes.string.isRequired,
    amChartConfig: PropTypes.object.isRequired,
    dataProvider: PropTypes.object.isRequired
  };

  componentDidMount() {
    console.log('componentDidMount Chart this.props', this.props);
    this.props.getChartData(this.props.chartId);
  }
  componentWillUnmount() {
    console.log('componentWillUnmount!');
    AmCharts.clear();
  }
  /**
   * when component is updated (rendered) - paste an amChart
   */
  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate prevProps', prevProps);

    let { dataProvider } = this.props;
    console.log('componentDidUpdate dataProvider', dataProvider);
    if (dataProvider && dataProvider.data && !dataProvider.isLoading) {
      console.log('dataProvider--', dataProvider);
      this.renderChart();
    }
  }
  /**
   * if chart changed - delete previous and request data for a next one.
   */
  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps nextProps', nextProps);
    if (nextProps.chartId !== this.props.chartId || nextProps.timePeriodId !== this.props.timePeriodId) {
      console.log('clear', this.props);
      AmCharts.clear();
      this.props.getChartData(nextProps.chartId);
    }
  }
  /**
   * merge amChart configs with data from a server (dataProvider)
   * amChartConfig - predefined configs (from constants) for amChart
   */
  renderChart() {
    let { dataProvider, chartId } = this.props;
    let { amChartConfig }  = this.props.config;
    if (amChartConfig.type === 'map') {
      AmCharts.maps.ukraineLow = ukraineLow;
      amChartConfig.listeners[0].method = fillMapWithData(dataProvider.data);
      AmCharts.makeChart(chartId, amChartConfig);
      return;
    }
    amChartConfig.dataProvider = dataProvider.data;
    console.log('renderChart! amChartConfig', amChartConfig);
    AmCharts.makeChart(chartId, amChartConfig);
  }

  render() {
    let { dataProvider, chartId } = this.props;
    console.log('Chart rendering!! this.props', this.props);
    return (
      <div>
        <div> {this.addSpinner(dataProvider)}</div>
        <div id={chartId} className="amchart_div"></div>
      </div>
    );
  }

  addSpinner(dataProvider) {
    if (!dataProvider || dataProvider.isLoading) {
      return <div>Loading ...</div>;
    }
  }
}

/**
 *
 * @returns dataProvider - data for chart
 * @returns config - config fot this component
 * @returns chartId - id form route parameters
 **/
const mapStateToChartFactory = (state, ownProps) => {
  let { chartId } =  ownProps.params;
  console.log('chartId', chartId);
  return {
    dataProvider: state.statistics[chartId],
    config: map[chartId],
    chartId: chartId,
    timePeriodId: state.settings.timePeriodId
  };
};

const mapDispatchToChartFactory = (dispatch) => {
  return {
    getChartData: (chartId) => dispatch(loadStatistics(map[chartId].callApi.url, chartId))
  };
};

export default connect(
  mapStateToChartFactory, mapDispatchToChartFactory
)(Chart);