public with sharing class fetchingObjectsAndFields {
    
    @AuraEnabled(cacheable = true)
    public static List<string> fetchAllSObjects(){
        try {
            List<string> sObjectList = new List<string>();
            for (Schema.SObjectType sObjType : Schema.getGlobalDescribe().values()) {
                Schema.DescribeSObjectResult sObjectProperties = sObjType.getDescribe();
                if(!sObjectProperties .isCreateable()){
                    continue;
                }
                if(sObjectProperties.isCustom()){
                    sobjectList.add(sObjectProperties.getName());
                }
                else if(sObjectProperties.getRecordTypeInfos().size() > 0){
                    sobjectList.add(sObjectProperties.getName());
                }
            }
            return sObjectList;
        } catch (Exception e) {
            throw e;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<string> fetchAllFields(string objectName){
        try {
            map<string, Schema.SObjectType> allSObject = Schema.getGlobalDescribe();
            List<string> fieldsList = new List<string>();
            for ( Schema.SObjectField fields: allSObject.get(objectName).getDescribe().fields.getMap().Values() )
            {
                fieldsList.add(fields.getDescribe().getName());
            }
            return fieldsList;
        } catch (Exception e) {
            throw e;
        } 
    } 

    @AuraEnabled(cacheable=true)
    public static Map<String, Boolean> fetchFieldRequiredInfo(String objectName) {
        try {
            Map<String, Schema.SObjectType> allSObjects = Schema.getGlobalDescribe();
            Map<String, Boolean> fieldRequiredInfo = new Map<String, Boolean>();

            if (allSObjects.containsKey(objectName)) {
                Schema.SObjectType objType = allSObjects.get(objectName);
                Map<String, Schema.SObjectField> fieldsMap = objType.getDescribe().fields.getMap();

                for (String fieldName : fieldsMap.keySet()) {
                    Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(fieldName).getDescribe();
                    fieldRequiredInfo.put(fieldName, !fieldDescribe.isNillable());
                }
            }

            return fieldRequiredInfo;
        } catch (Exception e) {
            throw e;
        }
}

}