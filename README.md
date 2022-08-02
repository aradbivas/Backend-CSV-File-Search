# Guidelines

## Requirements
`data.csv` file is the data source.

The user base (data.csv) can grow exponentially, so searching lineraly is not a good solution.
I used CreateReadStream method to create a stream and Papaparse moudle to read the file in chunks (steps).
for each step, I called the relevant methods to insert the data to HashMap, and they of the HashMap is the certain data where looking for.
for example, if I'm looking for the data by the user ID, the key of the data would be the id, and the value is the user.

for data which they key can by assoicted to diffrente user, I checked first if the key already exists, if it's already exists, I created array as the value and pushed the new user to this array.
for example for search by age, that multiply users can have the same age, the key is the age, that holds array of users in that age as value.

this give the search O(1) time complexity.

The search by name methods, is depence if the input for the search is full-name, first name or surename only, or the prefix of the first name or surename.
prefix must be atleast 3 characters long.
for fullName, first name and surename searches, I used the same methods as before, as saving the name as key, and pushing the value the array,
for searching by prefix, i used suffix tree data structures to save the data, and and then search the tree if prefix is exists,
time complexity for that is o(H) which h is the hight of the tree.

Get user by Id
    - GET /users/a2ee2667-c2dd-52a7-b9d8-1f31c3ca4eae
    - return the requested user details, searching by it's ID.

Example required response:
{
    "id": "ae8da2bf-69f6-5f40-a5e6-2f1fedb5cea6",
    "name": "Ricardo Wise",
    "dob": "13/1/1973",
    "country": "AE"
}

Get users list by country
    - GET /users?country=US
    - return a list of all users from requested country.

Get users list by age
    - GET /users?age=30
    -  return a list of all users which at the same age at the time of the request

Get users list by name
    - GET /users?name=Susan
    - returns all users which name matches the requested name
    - Matching names rules:
        - Full match - for input "Susan James" should return all users with name "Susan James".
        - Full first name or last name - for input "Susan" should return all users with that first or last name.
        - Partial match (minimum 3 chars) - for input "Sus", should return all users with first or last name that begin with "Sus".
        - Should support non case sensitive search (Searching for "susan" should return users with name "Susan").

Example required response for list of users:
[    
    {
        "id": "ae8da2bf-69f6-5f40-a5e6-2f1fedb5cea6",
        "name": "Ricardo Wise",
        "dob": "13/1/1973",
        "country": "AE"
    }
]

Delete user by id
    - DELETE /users/a2ee2667-c2dd-52a7-b9d8-1f31c3ca4eae
    - delete the user, after the call the user will not be returned by any of the previous APIs.
```


### Start up the service
```
npm install
node index.js
```
