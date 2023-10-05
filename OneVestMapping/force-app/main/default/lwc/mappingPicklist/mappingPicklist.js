import { LightningElement, api } from 'lwc';

export default class MappingPicklist extends LightningElement {
    @api salesforceFields = [];
    @api oVestFields = [];
    salesforceFieldValue;
    oneVestFieldValue;

    @api get salesForceValue() {
        return this.salesforceFieldValue;
    }

    @api get oVestValue() {
        return this.oneVestFieldValue;
    }

    handleOneVestFieldChange(event) {
        const prevVal = this.oneVestFieldValue;
        this.checkField('OneVest', event.detail.value);
        this.oneVestFieldValue = event.detail.value;
        this.handleValueChange('OneVest', prevVal, this.oneVestFieldValue);
    }

    handleSalesforceFieldChange(event) {
        const prevVal = this.salesforceFieldValue;
        this.checkField('Salesforce', event.detail.value);
        this.salesforceFieldValue = event.detail.value;
        this.handleValueChange('Salesforce', prevVal, this.salesforceFieldValue);
    }

    checkField(type, value) {
        const paramData = {
            Type: type,
            Value: value
        };
        this.dispatchEvent(new CustomEvent('validatefield', { detail: paramData }));
    }

    handleValueChange(type, prevVal, newVal) {
        const paramData = {
            FieldType: type,
            PrevValue: prevVal,
            NewValue: newVal
        };
        this.dispatchEvent(new CustomEvent('fieldchange', { detail: paramData }));
    }
}