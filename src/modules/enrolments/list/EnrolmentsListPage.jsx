import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { createSelector } from 'reselect';
import {Table, Column, Cell} from 'fixed-data-table';
import {push} from 'react-router-redux';

import * as dictConst from '../../dictionaries/constants';
import {loadEnrolments, setFieldWidthEnrolments} from './../actions';
import loadDictionaries from '../../dictionaries/actions';
import {isDataForEnrolmentLoaded, decodeEnrolments, getEnrolmentIdByIndex} from '../helpers';
import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';

import Loading from 'loading';
import {ENROLMENT_LIST_REDUCER, FIELD_NAMES} from './../constants';

class EnrolmentsListPage extends Component {
  constructor(props) {
    super(props);
  }

  _onColumnResizeEndCallback = (newColumnWidth, columnKey) => {
    this.props.setFieldWidthEnrolments(newColumnWidth, columnKey);
  }

  _onClickRow = (e, index) => {
    let id = getEnrolmentIdByIndex(index);
    this.props.onClickRow(id);
  }

  componentDidMount() {
    const {limit, offset} = this.props.enrolmentList;
    this.props.loadDictionaries([dictConst.DEPARTMENTS, dictConst.ENROLMENTS_TYPES, dictConst.ENROLMENTS_STATUS_TYPES]);
    this.props.loadEnrolments({limit, offset});
  }

  render() {
    if (!isDataForEnrolmentLoaded(ENROLMENT_LIST_REDUCER)) {
      return <Loading/>;
    }

    let {decodedEnrolments, fieldWidth} = this.props;

    let cells = FIELD_NAMES.map((item) => {
      return <Column
          columnKey={item.field}
          header={<Cell>{item.name}</Cell>}
          cell={props => (
            <Cell {...props}>
              {decodedEnrolments[props.rowIndex][item.field]}
            </Cell>
            )
          }
          isResizable
          width={fieldWidth[item.field]}
        />
    });

    return (
      <Table
        rowsCount={decodedEnrolments.length}
        rowHeight={50}
        headerHeight={70}
        onColumnResizeEndCallback={this._onColumnResizeEndCallback}
        isColumnResizing={false}
        onRowClick={this._onClickRow}
        width={950}
        height={420}
      >
        {cells}
      </Table>
    );
  }
}

// const select = (state)=> {
//   return {
//     enrolmentList: state.enrolments.list,
//     dictionaries: state.dictionaries
//   };
// };

export const getDecodedEnrolments = createSelector(
  [ (state) => state.enrolments.list,
   (state) => state.dictionaries,
   (state) => state.enrolments.list.fieldWidth],
  (enrolmentList, listOfDict, fieldWidth) => ({
    decodedEnrolments: decodeEnrolments(enrolmentList, listOfDict),
    enrolmentList: enrolmentList,
    fieldWidth: fieldWidth
  })
)

const mapDispatchToEnrolments = (dispatch) => (
  { loadEnrolments: (params) => dispatch(loadEnrolments(params)),
    loadDictionaries: (dicArray) => dispatch(loadDictionaries(dicArray)),
    setFieldWidthEnrolments: (newWidth, columnKey) => dispatch(setFieldWidthEnrolments(newWidth, columnKey)),
    onClickRow: (id) => dispatch(push(`/enrolments/${id}/info`))
  }
);

export default connect(
  getDecodedEnrolments,
  mapDispatchToEnrolments
)(EnrolmentsListPage);