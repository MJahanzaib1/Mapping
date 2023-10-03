import { LightningElement,track,api } from 'lwc';

export default class MappingPicklist extends LightningElement {
    @api salesforceFields = [];
    @api oVestFields = [];
    salesforceFieldValue;
    oneVestFieldValue;

    oneVestFieldChange(event) {
        this.oneVestFieldValue = event.detail.value;
        this.creatingFieldMap();
    }

    salesforceFieldChange(event) {
        this.salesforceFieldValue = event.detail.value;
        this.creatingFieldMap();
    }

    creatingFieldMap(){
        if(this.salesforceFieldValue && this.oneVestFieldValue){
            let paramData = {OneVestField:this.oneVestFieldValue,
                                SalesforceField: this.salesforceFieldValue};
            this.dispatchEvent(new CustomEvent('savemap',{detail: paramData}));
        }
    }
}
