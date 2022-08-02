const fs = require('fs')
const path = require('path')
const papa = require("papaparse");
var Trie = require('trie-prefix-tree');

const usersMapByCountry = new Map();
const usersMapByID = new Map();
const usersMapByName = new Map();
const usersMapByDateOfBirth = new Map();
const usersTrieByPartialNames = new Trie([]);

const pathCsv = path.join(__dirname, '..', 'data.csv')

    function readCSV()
    {
        return new Promise(async (resolve, reject) => {
            const file = await fs.createReadStream(pathCsv);
            await papa.parse(file, {
                header: true,
                step: function (row) {
                    InsertMapByDOB(row.data);
                    InsertMapByID(row.data);
                    InsertMapByCountry(row.data);
                    InsertMapByName(row.data);
                },
                complete: function () {
                    resolve();
                    console.log("File read successfully!");
                },
                error : function (err) {
                    reject(err)
                }
            });
        });

    }
    function InsertMapByID(user)
    {
        usersMapByID.set(user["Id"], user);
    }
    function GetUserAge(DOB)
    {
        const year = new Date().getFullYear();
        DOB = DOB.split("/");
        let age = year - parseInt(DOB[2]);
        return age.toString();
    }
    function InsertMapByDOB(user)
    {
        let age = GetUserAge(user["DOB"]);
        if(usersMapByDateOfBirth.has(age))
        {
            usersMapByDateOfBirth.get(age).push(user);
        }
        else {
            usersMapByDateOfBirth.set(age, [user]);
        }
    }
    function InsertMapByCountry(user)
    {
        if(usersMapByCountry.has(user["Country"]))
        {
            usersMapByCountry.get(user["Country"]).push(user);
        }
        else
        {
            usersMapByCountry.set(user["Country"], [user]);
        }
    }
    function InsertByNameHelper(name,user)
    {
        if(usersMapByName.has(name))
        {

            usersMapByName.get(name).push(user);
        }
        else
        {
            usersMapByName.set(name, [user]);
            if(!name.includes(" "))
            {
                addUserToParitalNameTrie(user, name);
            }
        }

    }
    function InsertMapByName(user)
    {
        let fullName = user["Name"];

        InsertByNameHelper(fullName,user);
        fullName = fullName.split(" ");
        const firstName = fullName[0];
        const lastName = fullName[1]
        InsertByNameHelper(firstName,user);
        InsertByNameHelper(lastName,user);

    }
    function deleteParamFromMap(id,param,map)
    {
        let name = usersMapByID.get(id)[param];
        let removedUArr= map.get(name).filter(user => user.Id !== id)
        map.set(name, removedUArr);
    }
    function addUserToParitalNameTrie(user,name){

        usersTrieByPartialNames.addWord(name);
    }

    function getUsersByPrefixName(partialName) {
        const prefixNames = usersTrieByPartialNames.getPrefix(partialName);
        const ans = new Map();
        if (partialName.length>=3){
            for (const name of prefixNames){
                const nameMap = usersMapByName.get(name);
                for (const user of nameMap){
                    if (ans.has(partialName))
                    {
                        ans.get(partialName).push(user);
                    }
                    else
                    {
                        ans.set(partialName,[user]);
                    }
                }
            }
        }
        return ans;
    }

    async function checkIfFiledWasRead()
    {
        if(usersMapByID.size === 0)
        {
            try {
                await readCSV();
            }
            catch (err)
            {
                console.log(err);
            }
        }
    }
module.exports = {

    getUserById: async function(id){
        console.log(`getUserById called with id: ${id}`);

        await checkIfFiledWasRead();
        return usersMapByID.get(id);
    },

    getUsersByAge: async function(age) {
        console.log(`getUsersByAge called with age: ${age}`);
        await checkIfFiledWasRead();

        return usersMapByDateOfBirth.get(age);
        
    },

    getUsersByCountry: async function(country) {
        console.log(`getUsersByCountry called with country: ${country}`);

        await checkIfFiledWasRead();

        return usersMapByCountry.get(country.toUpperCase());
    },

    getUsersByName: async function(name) {
        console.log(`searchUsersByName called with name: ${name}`);
        await checkIfFiledWasRead();


        let nameSet = new Set();
        name = name[0].toUpperCase() + name.substring(1);
        if(name.includes(" "))
        {
            nameSet.add(usersMapByName.get(name))
        }
        else if(usersMapByName.has(name))
        {
            nameSet.add(usersMapByName.get(name));
        }
        else
        {
            nameSet.add(getUsersByPrefixName(name).get(name));
        }
        let uniqNameArray = [...nameSet]

        return uniqNameArray;

    },

    deleteUser: async function(id) {
        console.log(`deleteUser called with id: ${id}`);
        await checkIfFiledWasRead();

        if(usersMapByID.has(id))
        {
            let age = GetUserAge(usersMapByID.get(id)["DOB"])
            let removedUserByAgeArr = usersMapByDateOfBirth.get(age).filter(user => user.Id !== id);
            usersMapByDateOfBirth.set(age, removedUserByAgeArr);

            deleteParamFromMap(id,"Name", usersMapByName)
            deleteParamFromMap(id,"Country", usersMapByCountry)
            usersMapByID.delete(id);
        }
        return usersMapByID.has(id);
    }
}