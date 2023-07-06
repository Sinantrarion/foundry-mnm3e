export async function ParserAccess(requestURL){
    requestURL = "https://raw.githubusercontent.com/Sinantrarion/foundrymnm3e/main/module/helpers/charactertest.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    const dataActor = await response.json();  

            console.log(dataActor);
    var actorJson = await GenerateActor(dataActor);
    
    actorJson = PopulateActorData(actorJson, dataActor);
            console.log(actorJson); 
    //await Actor.create(actorJson);
}

async function GenerateActor(dataActor){
    return new Actor({name: dataActor.document.public.character._name, type:"hero"}).toObject()
}

function PopulateActorData(actorStub, dataActor){
    const dataBase = dataActor.document.public.character;

    // ----ABILITIES----
    actorStub.system.abilities.str.purchased = parseInt(dataBase.attributes.attribute[0]._base);
    actorStub.system.abilities.sta.purchased = parseInt(dataBase.attributes.attribute[1]._base);
    actorStub.system.abilities.agl.purchased = parseInt(dataBase.attributes.attribute[2]._base);
    actorStub.system.abilities.dex.purchased = parseInt(dataBase.attributes.attribute[3]._base);
    actorStub.system.abilities.fgt.purchased = parseInt(dataBase.attributes.attribute[4]._base);
    actorStub.system.abilities.int.purchased = parseInt(dataBase.attributes.attribute[5]._base);
    actorStub.system.abilities.awe.purchased = parseInt(dataBase.attributes.attribute[6]._base);
    actorStub.system.abilities.pre.purchased = parseInt(dataBase.attributes.attribute[7]._base);

    // ----DEFENCES----
    actorStub.system.defenses.dodge.purchased = parseInt(dataBase.defenses.defense[0].cost._value);
    actorStub.system.defenses.parry.purchased = parseInt(dataBase.defenses.defense[1].cost._value);
    actorStub.system.defenses.fortitude.purchased = parseInt(dataBase.defenses.defense[2].cost._value);
    actorStub.system.defenses.toughness.purchased = parseInt(dataBase.defenses.defense[3].cost._value);
    actorStub.system.defenses.will.purchased = parseInt(dataBase.defenses.defense[4].cost._value);
    
    // ----SKILLS----
    const skillsList = dataBase.skills.skill;
    const actorStubSkillList = ['acr', 'ath', 'dec', 'inm', 'ins', 'inv', 'prc', 'prs', 'soh', 'ste', 'tec', 'tre', 'veh'];


    for (var i = 0; i < actorStubSkillList.length; i++)
    {
        var tempValue = skillsList[GetSkill(skillsList, i)]._base;
        tempValue = (tempValue === "-") ? 0 : parseInt(tempValue);
        actorStub.system.skills[actorStubSkillList[i]].purchased = tempValue;
    }

    // Rewrite this completely one day to implement infinite skills? Copy from PF2e or PF1e or something. 
    var comb = ['clc1', 'clc2', 'rng1', 'rng2'];
    var numb = [0, 2]
    var namb = ['Close Combat: ', 'Ranged Combat: '];
    var namr = ['CC: ', 'RC: '];
    for (var i = 0; i < numb.length; i++)
    {
        var skillArray = GetMultipleSkills(skillsList, numb[i]);
        for (var y = 0; y < skillArray.length; y++)
        {
            var tempValue = skillsList[skillArray[y]]._base;
            tempValue = (tempValue === "-") ? 0 : parseInt(tempValue);
            actorStub.system.skills[comb[y+numb[i]]].purchased = tempValue;

            if(skillsList[skillArray[y]]._name !== ""){
                var skillName = skillsList[skillArray[y]]._name;
                actorStub.system.skills[comb[y+numb[i]]].subtype = skillName.replace(namb[i], namr[i]);
            }
        }
    }

    comb = ['exp1', 'exp2', 'exp3', 'exp4', 'exp5'];
    var skillArray = GetMultipleSkills(skillsList, 1);
    for (var i = 0; i < skillArray.length; i++)
    {
        var tempValue = skillsList[skillArray[i]]._base;
        tempValue = (tempValue === "-") ? 0 : parseInt(tempValue);
        actorStub.system.skills[comb[i]].purchased = tempValue;

        const variant = skillsList[skillArray[i]]._name.split(":")[0].trim(); 
        switch(variant) {
            case "Expertise (AGL)":
                console.log("Matched Expertise (AGL)");
                actorStub.system.skills[comb[i]].ability = "agl";
            break;
            case "Expertise (AWE)":
                console.log("Matched Expertise (AWE)");
                actorStub.system.skills[comb[i]].ability = "awe";
            break;
            case "Expertise (DEX)":
                console.log("Matched Expertise (DEX)");
                actorStub.system.skills[comb[i]].ability = "dex";
            break;
            case "Expertise (FGT)":
                console.log("Matched Expertise (FGT)");
                actorStub.system.skills[comb[i]].ability = "fgt";
            break;
            case "Expertise (PRE)":
                console.log("Matched Expertise (PRE)");
                actorStub.system.skills[comb[i]].ability = "pre";
            break;
            case "Expertise (STA)":
                console.log("Matched Expertise (STA)");
                actorStub.system.skills[comb[i]].ability = "sta";
            break;
            case "Expertise (STR)":
                console.log("Matched Expertise (STR)");
                actorStub.system.skills[comb[i]].ability = "str";
            break;
            case "Expertise":
                console.log("Matched default Expertise, remains INT");
            break;
            default:
                console.warn(variant, " does not exist as a valid Expertise")
            break;
        }
        var skillName = skillsList[skillArray[i]]._name;
        actorStub.system.skills[comb[i]].subtype = skillName.replace(variant, "EX")
    }

    //'exp1', 'exp2', 'exp3', 'exp4', 'exp5', 
    // actorStub.system.exp2.purchased = parseInt();
    // actorStub.system.exp3.purchased = parseInt();
    // actorStub.system.exp4.purchased = parseInt();
    // actorStub.system.exp5.purchased = parseInt();

    // ----GENERIC----
    actorStub.system.generic.pl = parseInt(dataBase.powerlevel._value);
    var extrapp = parseInt(dataBase.powerpoints._value) - parseInt(dataBase.resources._startingpp);
    actorStub.system.generic.extrapp = extrapp;

    var disposition = 0;
    switch(dataActor.document.public.character._relationship) {
        case 'ally':
        disposition = 1;
        break;
        case 'enemy':
        disposition = -1;
        break;
        case 'neutral':
        disposition = 0;
        break;
        default:
        break
    }
    actorStub.prototypeToken.disposition = disposition;

    // ----DETAILS----
    actorStub.system.age = parseInt(dataBase.personal._age);
    actorStub.system.hair = dataBase.personal._hair;
    actorStub.system.eyes = dataBase.personal._eyes;
    actorStub.system.height = dataBase.personal.charheight._text; // Maybe to change. There is _value, which you int(_value/12) for feet and (_value%12) for inches.
    actorStub.system.weight = parseInt(dataBase.personal.charweight._value); 
    actorStub.system.gender = dataBase.personal._gender;
    actorStub.system.heroname = dataActor.document.public.character._name;

    // = parseInt(dataBase.);
    return actorStub;
}

function GetSkill(skillsList, skillIndex) {
    const skillNames = [
        'Acrobatics',
        'Athletics',
        'Deception',
        'Insight',
        'Intimidation',
        'Investigation',
        'Perception',
        'Persuasion',
        'Sleight of Hand',
        'Stealth',
        'Technology',
        'Treatment',
        'Vehicles'
    ];

    const matchingIndexes = skillsList.map(e=>e._name).indexOf(skillNames[skillIndex])

    return matchingIndexes;
}

function GetMultipleSkills(skillsList, skillIndex) {
    const skillNames = [
        'Close Combat',
        'Expertise',
        'Ranged Combat'
    ];

    const matchingIndexes = skillsList
        .map((e, index) => ({ _name: e._name, index })) // Map objects to include both name and index
        .filter(obj => obj._name.includes(skillNames[skillIndex])) // Filter objects with names containing the keyword
        .map(obj => obj.index); // Extract the indexes

    return matchingIndexes;
}