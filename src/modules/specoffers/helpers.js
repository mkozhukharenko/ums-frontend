import store from 'store';
import * as dictConstants from '../dictionaries/constants';
import {isDictLoaded} from '../dictionaries/helpers';
import {getSpecofferEnrolments} from './reducers/view.js';

let {
  DEPARTMENTS,
  ENROLMENTS_TYPES,
  ENROLMENTS_STATUS_TYPES
} = dictConstants;

/**
 * check if enrolments loaded && dictionaries (used only inside enrolment list container)
 * @param specofferId
 * @returns {*|boolean}
 */
export function isDataForEnrolmentLoaded(specofferId) {
  let state = store.getState();
  let entity = getSpecofferEnrolments(state);

  return isDictLoaded([DEPARTMENTS, ENROLMENTS_TYPES, ENROLMENTS_STATUS_TYPES], state.dictionaries)
    && !entity.isLoading
    && !!entity.data[specofferId];
}

/**
 * check if specoffers loaded && dictionaries (used only inside specoffers list container)
 * @returns {*|boolean}
 */
export function isDataForSpecoffersLoaded() {
  let state = store.getState();
  let entity = state.specoffers.list;

  return isDictLoaded([DEPARTMENTS], state.dictionaries)
    && !entity.isLoading;
}

/**
 *
 * @param rowSpecoffers - list of row specoffers
 * @returns {Array} - array of decoded specoffers
 */
export function decodeSpecoffers(specoffers, dictionaries) {
  return specoffers.resources.map((item)=> {
    return decodeOneSpecoffer(item, dictionaries);
  });
}

export function decodeOneSpecoffer(item, dictionaries) {
  if (!item) return {};

  let {DEPARTMENTS, SPECOFFERS_TYPES, EDUCATION_FORM_TYPES} = dictionaries;

  return Object.assign({}, item, {
    departmentId: DEPARTMENTS.resourcesMap[item.departmentId],
    specofferTypeId: SPECOFFERS_TYPES.resourcesMap[item.specofferTypeId],
    educationFormTypeId: EDUCATION_FORM_TYPES.resourcesMap[item.educationFormTypeId]
  });
}