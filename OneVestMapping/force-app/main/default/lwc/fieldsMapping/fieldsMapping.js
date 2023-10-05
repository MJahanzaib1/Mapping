import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchSalesforceFields from '@salesforce/apex/fetchingObjectsAndFields.fetchAllFields';
import fetchOneVestFields from '@salesforce/apex/fetchingOneVestData.fetchfields';
import postFieldMap from '@salesforce/apex/fetchingOneVestData.postJSONOnMiddleware';

export default class FieldsMapping extends LightningElement {
    @track childComponents = [];
    salesforceObjectFields = [];
    oneVestObjectFields = [];
    fieldsMapping = [];
    oneVestMappedFields = [];
    salesforceMappedFields = [];
    id = 0;

    connectedCallback() {
        // Adding one child component on page
        this.addChildComponent();

        // Fetching and initializing Salesforce Fields
        fetchSalesforceFields({ objectName: 'User' })
            .then(result => {
                this.salesforceObjectFields = Object.keys(result).map(key => ({
                    label: result[key],
                    value: result[key]
                }));
            })
            .catch(error => {
                console.error('Error in fetching Salesforce fields:', error);
            });

        // Fetching data from One Vest API
        fetchOneVestFields()
            .then(result => {
                this.oneVestObjectFields = Object.keys(result).map(key => ({
                    label: result[key],
                    value: result[key]
                }));
            })
            .catch(error=>{
                console.error('Error in fetching One Vest fields:', error);
            });
        
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
        const fieldArray = this.getListName(Type);

        if (fieldArray.includes(Value)) {
            this.dispatchToastEvent('Error!', `${Type}Field: ${Value} has already been mapped`, 'error');
        }
    }

    handleUpdateMappedFieldList(event) {
        const { FieldType, PrevValue, NewValue } = event.detail;
        const fieldArray = this.getListName(FieldType);

        if (PrevValue) {
            fieldArray.splice(fieldArray.indexOf(PrevValue), 1);
        }
        fieldArray.push(NewValue);
    }

    getListName(type){
        return type === 'OneVest' ? this.oneVestMappedFields : this.salesforceMappedFields;
    }

    saveFieldsMap() {
        const backupOneVest = [...this.oneVestMappedFields];
        const backupSalesforce = [...this.salesforceMappedFields];
        this.template.querySelectorAll('c-mapping-picklist').forEach(element => {
            const oVestValue = element.oVestValue;
            const salesForceValue = element.salesForceValue;
            if(this.checkDuplicatesAndMissingFields(oVestValue,salesForceValue) === true){
                const tempMap = {
                    OV_fieldName: oVestValue,
                    INT_fieldName: salesForceValue
                };
                this.filterMappedFieldsList(oVestValue,salesForceValue);
                this.fieldsMapping.push(tempMap);
            }else{
                return;
            }
        });

        this.backupMappedLists(backupOneVest,backupSalesforce);
        if (this.fieldsMapping.length > 0) {
            console.log('Field Mapping:', JSON.stringify(this.fieldsMapping));
            postFieldMap({"fieldsMap" : JSON.stringify(this.fieldsMapping)})
                    .then(() => {
                            this.dispatchToastEvent('Success!', 'Fields have been mapped and Posted', 'success');
                    })
                    .catch(error => {
                            this.dispatchToastEvent('Error!', `${error} in posting data to middleware`, 'error');
                    });
            this.fieldsMapping = [];
            this.addChildComponent();
        }
    }

    checkDuplicatesAndMissingFields(oVestValue,salesForceValue){
        if(oVestValue === undefined && salesForceValue === undefined){
            return false;
        }
        else if (oVestValue && salesForceValue ) {
            if (!this.oneVestMappedFields.includes(oVestValue) || !this.salesforceMappedFields.includes(salesForceValue)) {
                this.dispatchToastEvent('Error!', 'Wrong Mapping: One Field is mapped twice', 'error');
                this.fieldsMapping = [];
                return false;
            }
            return true;
        } else {
            this.dispatchToastEvent('Error!', 'Mapping Elements missing', 'error');
            this.fieldsMapping = [];
            return false;
        }
    }

    filterMappedFieldsList(oVestValue,salesForceValue){
        this.salesforceMappedFields=this.salesforceMappedFields.filter(obj=>obj !== salesForceValue);
        this.oneVestMappedFields=this.oneVestMappedFields.filter(obj=> obj !== oVestValue);
    }

    backupMappedLists(backupOneVest,backupSalesforce){
        this.salesforceMappedFields = [...backupSalesforce];
        this.oneVestMappedFields = [...backupOneVest];
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