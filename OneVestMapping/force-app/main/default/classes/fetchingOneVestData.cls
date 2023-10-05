public with sharing class fetchingOneVestData {
    @AuraEnabled(cacheable = true)
    public static List<string> fetchfields(){
        try{
            List<String> oneVestFields = new List<String>();
            //will get data from One Vest API
            List<String> oneVestJSON = new List<String>{'id', 'name', 'age', 'number','data'};

            for (String field : oneVestJSON) {
                oneVestFields.add(field);
            }
            return oneVestFields;
        }
        catch (Exception e) {
            throw e;
        }

    }
    
    @AuraEnabled(cacheable = true)
    public static void postJSONOnMiddleware(string fieldsMap){
        try{
            //Posting received fields map on middleware
            System.debug(fieldsMap);
        }catch (Exception e) {
            throw e;
        }
    }
}