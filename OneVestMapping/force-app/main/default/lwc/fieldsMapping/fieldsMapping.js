import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchAllFields from '@salesforce/apex/fetchingObjectsAndFields.fetchAllFields';

export default class FieldsMapping extends LightningElement {
    @track childComponents = [];
    salesforceObjectFields = [];
    oneVestObjectFields = [];
    fieldsMapping = [];
    oneVestMappedFields = [];
    salesforceMappedFields = [];
    id = 0;
    oneVestJSON = ['id', 'name', 'age', 'number'];

    connectedCallback() {
        // Adding one child component on page
        this.addChildComponent();

        // Fetching and initializing Salesforce Fields
        fetchAllFields({ objectName: 'Account' })
            .then(result => {
                this.salesforceObjectFields = Object.keys(result).map(key => ({
                    label: result[key],
                    value: result[key]
                }));
            })
            .catch(error => {
                console.error('Error in fetching fields:', error);
            });

        // Creating OneVest Fields from JSONList
        this.oneVestObjectFields = this.oneVestJSON.map(field => ({
            label: field,
            value: field
        }));
    }

    addChild() {
        this.addChildComponent();
    }

    addChildComponent() {
        this.childComponents.push({ key: this.id });
        this.id++;
    }

    handleValidateField(event) {
        const { Type, Value } = event.detail;
        const fieldArray = Type === 'OneVest' ? this.oneVestMappedFields : this.salesforceMappedFields;

        if (fieldArray.includes(Value)) {
            this.dispatchToastEvent('Error!', `${Type}Field: ${Value} has already been mapped`, 'error');
        }
    }

    handleUpdateMappedFieldList(event) {
        const { FieldType, PrevValue, NewValue } = event.detail;
        const fieldArray = FieldType === 'OneVest' ? this.oneVestMappedFields : this.salesforceMappedFields;

        if (PrevValue) {
            fieldArray.splice(fieldArray.indexOf(PrevValue), 1);
        }
        fieldArray.push(NewValue);
    }

    saveFieldsMap() {
        let isError = false;
        const backupOneVest = [...this.oneVestMappedFields];
        const backupSalesforce = [...this.salesforceMappedFields];
        this.template.querySelectorAll('c-mapping-picklist').forEach(element => {
            const oVestValue = element.oVestValue;
            const salesForceValue = element.salesForceValue;

            if (oVestValue && salesForceValue) {
                if (!this.oneVestMappedFields.includes(oVestValue) || !this.salesforceMappedFields.includes(salesForceValue)) {
                    this.dispatchToastEvent('Error!', 'Wrong Mapping: One Field is mapped twice', 'error');
                    this.salesforceMappedFields = [...backupSalesforce];
                    this.oneVestMappedFields = [...backupOneVest];
                    this.fieldsMapping = [];
                    isError = true;
                    return;
                }

                const tempMap = {
                    OneVestField: oVestValue,
                    SalesforceField: salesForceValue
                };

                this.salesforceMappedFields=this.salesforceMappedFields.filter(obj=>obj !== salesForceValue);
                this.oneVestMappedFields=this.oneVestMappedFields.filter(obj=> obj !== oVestValue);
                this.fieldsMapping.push(tempMap);
            } else {
                this.dispatchToastEvent('Error!', 'Mapping Elements missing', 'error');
                isError = true;
                this.salesforceMappedFields = [...backupSalesforce];
                this.oneVestMappedFields = [...backupOneVest];
                this.fieldsMapping = [];
                return;
            }
        });

        if (!isError) {
            this.dispatchToastEvent('Success!', 'Fields have been mapped', 'success');
            console.log('Field Mapping:', JSON.stringify(this.fieldsMapping));
            this.salesforceMappedFields = [...backupSalesforce];
            this.oneVestMappedFields = [...backupOneVest];
            this.fieldsMapping = [];
            this.addChildComponent();
        }
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