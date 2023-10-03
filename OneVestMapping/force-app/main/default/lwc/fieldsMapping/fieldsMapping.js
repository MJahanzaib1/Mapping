import { LightningElement,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchAllFields from '@salesforce/apex/fetchingObjectsAndFields.fetchAllFields';

export default class FieldsMapping extends LightningElement {
    @track childComponents = [];
    salesforceObjectFields = [];
    oneVestObjectFields = [];
    fieldsMapping = [];
    oneVestMappedFields = [];
    salesfroceMappedFields = [];
    fieldsMappingCache = [];
    id = 0;
    counter = 0;

    oneVestJSON = ['id','name','age','number']

    connectedCallback(){

        //adding one child component on page
        this.childComponents.push({ key: this.id });
        this.counter++;
        this.id++;

        //fetching and initializing salesforce Fields
        fetchAllFields({ objectName: "Account" })
        .then(result => {
            for (let key in result) {
                const temp = [{ label: result[key], value: result[key]}];
                this.salesforceObjectFields = [...this.salesforceObjectFields, ...temp];
            }
        })
        .catch(error => {
                console.log('Error in fetching fields');
        });

        //creating OneVest Fields from JSONList
        for(let key in this.oneVestJSON){
            const temp = [{ label: this.oneVestJSON[key], value: this.oneVestJSON[key]}];
            this.oneVestObjectFields = [...this.oneVestObjectFields,...temp];
        }
    }

    addChild() {
        //if(this.counter < 10){
            this.childComponents.push({ key: this.id});
            this.counter++;
            this.id++;
        //}
    }

    saveCacheFieldsMap(event){
        //console.log('Event Detail: ',JSON.stringify(event.detail));
        if(this.oneVestMappedFields.includes(event.detail.OneVestField)){
            this.dispatchEvent(this.dispatchToastEvent('Error!', `OneVestField: ${event.detail.OneVestField} has alreday been mapped` , 'error'));
            return;
        }
        else if(this.salesfroceMappedFields.includes(event.detail.SalesforceField)){
            this.dispatchEvent(this.dispatchToastEvent('Error!', `SalesforceField: ${event.detail.SalesforceField} has alreday been mapped` , 'error'));
            return;
        }
        else{
            this.oneVestMappedFields.push(event.detail.OneVestField);
            this.salesfroceMappedFields.push(event.detail.SalesforceField);
            this.fieldsMappingCache.push(event.detail);
            console.log('Temporary data: ',JSON.stringify(this.fieldsMappingCache));
        }
        
    }

    saveFieldsMap(){
        this.fieldsMapping = [...this.fieldsMapping ,...this.fieldsMappingCache];
        this.counter= 0;
        this.fieldsMappingCache = [];
        this.childComponents = [];
        this.childComponents.push({ key: this.id });
        console.log('Field Mapping: ',JSON.stringify(this.fieldsMapping));
    }

    dispatchToastEvent(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(toastEvent);
    }
}