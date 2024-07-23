import { httpClient } from "../Utils/HttpClient";

export const getCardInCustomFields = (cardId) => {
  return httpClient.get(`api/CustomFields?CardId=${cardId}`);
};
export const UpdateCustomNumber = (Id,value) => {
  return httpClient.put(`/api/CustomFields/UpdateNumberField?value=${value}&Id=${Id}`);
};
export const CreateDropdown = (value) => {
  return httpClient.post(`/api/CustomFields/CreateDropdown`,value);
};
export const RemoveDropDown = (value) => {
  return httpClient.post(`/api/CustomFields/RemoveDropDown`,value);
};
export const SetOption = (DropdownId,OptionId) => {
  return httpClient.post(`/api/CustomFields/SetOptionToDropdown?dropDownId=${DropdownId}&dropdownOptionId=${OptionId}`);
};