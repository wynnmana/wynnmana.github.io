// Clearing data when the site is reloading (normal reload didnt clear data before)
window.addEventListener('keydown', function(event) {
    // Check if Ctrl key is pressed
    if (event.ctrlKey && event.key === 'r') {
        // Prevent the default action (normal reload)
        event.preventDefault();
        // Perform a hard reload (Ctrl + Shift + R)
        location.reload(true);
    }
});

const additionalInfo = document.getElementById("additionalInfo");


// Get the spellGain checkbox
const spellGainCheckbox = document.getElementById("spellGain");

// Get the spellGain input div
const spellGainInputDiv = document.getElementById("spellGainInput");

// Add event listener to the spellGain checkbox
spellGainCheckbox.addEventListener('change', function() {
    // If spellGain checkbox is checked, remove the 'hidden' class from the spellGain input div
    if (spellGainCheckbox.checked) {
        spellGainInputDiv.classList.remove('hidden');
    } else {
        // If spellGain checkbox is not checked, add the 'hidden' class to the spellGain input div
        spellGainInputDiv.classList.add('hidden');
    }
});



// Get the radiance checkbox
const radianceCheckbox = document.getElementById("radiance");

// Get the radiance input div and output table
const radianceInputDiv = document.getElementById("radianceInput");
const radianceOutputTable = document.getElementById("radianceOutput");
const divineHonorToggle = document.getElementById("divineHonorToggle");
const divineHonorCheckbox = document.getElementById("divineHonor");

// Add event listener to the radiance checkbox
radianceCheckbox.addEventListener('change', function() {
    // If radiance checkbox is checked, remove the 'hidden' class from the radiance input div and output table
    if (radianceCheckbox.checked) {
        radianceInputDiv.classList.remove('hidden');
        radianceOutputTable.classList.remove('hidden');
        divineHonorToggle.classList.remove('hidden');
    } else {
        // If radiance checkbox is not checked, add the 'hidden' class to the radiance input div and output table
        radianceInputDiv.classList.add('hidden');
        radianceOutputTable.classList.add('hidden');
        divineHonorToggle.classList.add('hidden');
    }
    
});

let radMultiplier = 1.2;
divineHonorCheckbox.addEventListener('change', function() {
    if (divineHonorCheckbox.checked) {
        radMultiplier = 1.25;
        console.log("Divine Honor on");
    } else {
        radMultiplier = 1.2;
        console.log("Divine Honor off");
    }
    inputChanged();
    console.log(radMultiplier);
});



// Defining behaviour for masks
const masksCheckbox = document.getElementById("masks");
const lunaticCheckbox = document.getElementById("lunatic");
const fanaticCheckbox = document.getElementById("fanatic");
const cowardCheckbox = document.getElementById("coward");
const awakenedCheckbox = document.getElementById("awakened");
const maskInputDiv = document.getElementById("maskInput");

masksCheckbox.addEventListener('change', function() {
    if (masksCheckbox.checked) {
        maskInputDiv.classList.remove('hidden');
    } else {
        maskInputDiv.classList.add('hidden');
    }
});

[lunaticCheckbox, fanaticCheckbox, cowardCheckbox].forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            // If one mask is checked uncheck the others
            [lunaticCheckbox, fanaticCheckbox, cowardCheckbox, awakenedCheckbox].forEach(cb => {
                if (cb !== this) {
                    cb.checked = false;
                }
            });
        } else if (this.checked == false) {
            [lunaticCheckbox, fanaticCheckbox, cowardCheckbox, awakenedCheckbox].forEach(cb => {
                if (cb !== this) {
                    // Behaviour for other checkboxes: If one checkbox is unchecked also uncheck all others (needed for awakened)
                    cb.checked = false;
                } else if (awakenedCheckbox.checked) {
                    // Behaviour for selected checkbox: If awakened is checked keep the checkbox you tried to uncheck checked
                    // So for example selecting lunatic after selecting awakened will uncheck all but lunatic
                    cb.checked = true;
                }
            });
        }
        inputChanged();
    });
});

awakenedCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Check lunatic, fanatic, and coward
        lunaticCheckbox.checked = true;
        fanaticCheckbox.checked = true;
        cowardCheckbox.checked = true;
    } else {
        // Uncheck all other checkboxes
        [lunaticCheckbox, fanaticCheckbox, cowardCheckbox].forEach(cb => {
            if (cb !== this) {
                cb.checked = false;
            }
        });
    }
    inputChanged();
});



function getMana() {
    let mrInput = document.getElementById("mr");
    let msInput = document.getElementById("ms");

    let mr = mrInput.value !== "" ? parseFloat(mrInput.value) + 25 : 25;
    let ms = msInput.value !== "" ? parseFloat(msInput.value) : 0;

    let TEMP_mr_ms_per_s_default = mr/5 + ms/3;
    let TEMP_mr_ms_per_s = [TEMP_mr_ms_per_s_default];

    if (radianceCheckbox.checked) {
        let TEMP_mr_ms_per_s_rad = ((mr-25)*radMultiplier + 25)/5 + (ms*radMultiplier)/3;
        let TEMP_mr_ms_per_s_avg_rad = (TEMP_mr_ms_per_s_default * 7 + TEMP_mr_ms_per_s_rad * 8)/15;

        TEMP_mr_ms_per_s = [TEMP_mr_ms_per_s_default,TEMP_mr_ms_per_s_rad,TEMP_mr_ms_per_s_avg_rad];
    }

    return TEMP_mr_ms_per_s; // [0] = Normal, [1] = Radiance, [2] = Average Radiance
}

function updateManaOutput() { // Not accounting for mana gain from spells

    let mana = getMana()[0];

    document.getElementById("manaGain").innerHTML = mana.toFixed(2);
    document.getElementById("output").innerHTML = mana.toFixed(2);

    if (radianceCheckbox.checked) {

        let manaRad = getMana()[1];
        let manaAvgRad = getMana()[2];

        document.getElementById("manaGainRad").innerHTML = manaRad.toFixed(2);
        document.getElementById("manaGainAvgRad").innerHTML = manaAvgRad.toFixed(2);
        document.getElementById("outputRad").innerHTML = manaRad.toFixed(2);
        document.getElementById("outputAvgRad").innerHTML = manaAvgRad.toFixed(2);

        updateShadow(manaAvgRad);
    } else {
        updateShadow(mana);
    }
}

// Calculating mana every time there's an input:

// Get all the input fields
const inputFields = document.querySelectorAll('input[type="number"], input[type="text"], input[type="checkbox"]');
// Add event listeners to all input fields
inputFields.forEach(inputField => {
    inputField.addEventListener('input', inputChanged);
    //inputField.setAttribute('autocomplete', 'new-password');
});

function inputChanged() {
    additionalInfo.classList.add("hidden");
    let cycle = getCycle();
    // Checking if the cycle has at least two different spells
    let hasDifferentSpells = false;
    for (let i = 0; i < cycle.length; i++) {
        for (let j = 0; j < cycle.length; j++) {
            if (cycle[i] != cycle[j]) {
                calculateMana(cycle);
                hasDifferentSpells = true;
                return;
            }
        }
    }
    if (!hasDifferentSpells) {
        updateManaOutput();
    }
}

function getCycle() {
    let spellSequence = document.getElementById("spellSequence").value;
    let cycle = [];
    for (let i = 0; i < spellSequence.length; i++) {
        let spellIndex = parseInt(spellSequence.charAt(i));
        if (spellIndex >= 1 && spellIndex <= 4) {
            cycle.push(spellIndex);
        } else {
            cycle.push('');
        }
    }
    return cycle;
}


function interpolateShadow(value) {
    const colorRanges = [
        [-10, -5, [128, 0, 0], [255, 0, 0]],
        [-5, 0, [255, 0, 0], [255, 255, 0]],
        [0, 5, [255, 255, 0], [0, 255, 0]],
        [5, 10, [0, 255, 0], [0, 128, 0]]
    ];

    // Cap value to -10 or 10 if outside range
    if (value <= -10) return "0rem 0rem 0.3rem 0.001rem rgb(128,0,0)"; // dark red
    if (value >= 10) return "0rem 0rem 0.3rem 0.001rem rgb(0,128,0)"; // dark green

    for (let i = 0; i < colorRanges.length; i++) {
        const [min, max, startColor, endColor] = colorRanges[i];
        if (value >= min && value <= max) {
            const ratio = (value - min) / (max - min);
            const [r1, g1, b1] = startColor;
            const [r2, g2, b2] = endColor;
            const r = Math.round(r1 + (r2 - r1) * ratio);
            const g = Math.round(g1 + (g2 - g1) * ratio);
            const b = Math.round(b1 + (b2 - b1) * ratio);
            return `0rem 0rem 0.3rem 0.001rem rgb(${r},${g},${b})`;
        }
    }
    return "0rem 0rem 0.3rem 0.001rem black"; // Default color
}

function updateShadow(value) {
    const divWithBorder = document.querySelector('.outputs');
    divWithBorder.style.boxShadow = interpolateShadow(value);
    // const divWithBorder = document.querySelectorAll('.input, .outputs');
    // divWithBorder.forEach(borderDiv => {
    //     borderDiv.style.boxShadow = interpolateShadow(value);
    // })
}


function calculateMana(cycle) {
    let cost = [];
    for (let i = 1; i <= 4; i++) {
        cost.push(parseFloat(document.getElementById("spell" + i).value));
    }
    
    let cps = parseFloat(document.getElementById("cps").value);

    // Mana gain from spells
    const spellGainCheckbox = document.getElementById('spellGain');
    if (spellGainCheckbox.checked) {
        let gain = []
        let spellGain = 0;
        for (let i = 1; i <= 4; i++) {
            spellGain = parseFloat(document.getElementById('spell'+i+'gain').value)
            if (spellGain > 0) {
                gain.push(spellGain);
            } else {
                gain.push(0);
            }
        }
        cycle_gain = 0;
        for (let i = 0; i < cycle.length; i++) {
            for (let j = 1; j <= 4; j++) {
                if (cycle[i] == j) {
                    cycle_gain = cycle_gain + gain[j-1];
                }
            }
        }
        cycle_gain_per_s = (cycle_gain/cycle.length) * cps / 3;
    } else {
        cycle_gain_per_s = 0;
    }

    for (let i = 0; i < cycle.length; i++) {
        for (let j = 0; j < 4; j++) {
            if (cycle[i] === j + 1) {
                cycle[i] = [cost[j], j + 1];
            }
        }
    }

    while (cycle[0][1] === cycle[cycle.length - 1][1]) {
        cycle.unshift(cycle.pop());
    }

    let cycle_cost = [];
    for (let i = 0; i < 2; i++) {
        if (cycle[i][0] <= 1) {
            cycle_cost.push(1);
        } else {
            cycle_cost.push(cycle[i][0]);
        }
    }

    let repeat = 0;
    for (let i = 2; i < cycle.length; i++) {
        if (cycle[i - 1][1] === cycle[i - 2][1]) {
            repeat++;
            if (cycle[i][0] + repeat * 5 <= 1) {
                cycle_cost.push(1);
            } else {
                cycle_cost.push(cycle[i][0] + repeat * 5);
            }
        } else {
            repeat = 0;
            if (cycle[i][0] <= 1) {
                cycle_cost.push(1);
            } else {
                cycle_cost.push(cycle[i][0]);
            }
        }
    }

    
    if (cycle[cycle.length - 1][1] === cycle[cycle.length - 2][1]) {
        repeat++; // Increment repeat for the last repetition
        if (cycle[0][0] + repeat * 5 > 1) {
            cycle_cost[0] += repeat * 5;
        }
    }
    
    // Factoring in Transcendence
    if (document.getElementById("transcendence").checked) {
        console.log(cycle_cost);
        for (let i = 0; i < cycle.length; i++) {
            cycle_cost[i] = cycle_cost[i] * 0.7;
        }
        console.log(cycle_cost);
    }

    if (masksCheckbox.checked) {
        // console.log("Before masks: "+cycle_cost);
        for (let i = 0; i < cycle_cost.length; i++) {
            let spellIndex = cycle[i][1]; // Spell index (1-4)
            let spellCost = cycle_cost[i]; // Spell cost
        
            // Check for each spell and its corresponding checkbox
            switch (spellIndex) {
                case 1:
                    if (fanaticCheckbox.checked) {
                        spellCost *= 0.3;
                    }
                    break;
                case 2:
                    if (cowardCheckbox.checked) {
                        spellCost *= 0.5;
                    }
                    break;
                case 3:
                    if (lunaticCheckbox.checked) {
                        spellCost *= 0.7;
                    }
                    break;
            }
            cycle_cost[i] = spellCost; // Update the cycle cost
        }
        // console.log("After masks: "+cycle_cost);
    }
    
    mr_ms_per_s = getMana();
    // Mana calculation :D
    let manaPerSecond = mr_ms_per_s[0] + cycle_gain_per_s - cps * cycle_cost.reduce((acc, val) => acc + val, 0) / cycle_cost.length / 3;
    document.getElementById("manaUsage").innerHTML = (manaPerSecond - mr_ms_per_s[0] - cycle_gain_per_s).toFixed(2);
    document.getElementById("manaGain").innerHTML = (mr_ms_per_s[0]+cycle_gain_per_s).toFixed(2);
    document.getElementById("output").innerHTML = manaPerSecond.toFixed(2);
    updateShadow(manaPerSecond);

    if (radianceCheckbox.checked) {
        document.getElementById("manaGainRad").innerHTML = (mr_ms_per_s[1]+cycle_gain_per_s).toFixed(2);
        document.getElementById("manaGainAvgRad").innerHTML = (mr_ms_per_s[2]+cycle_gain_per_s).toFixed(2);

        let costRad = [];
        let baseCost = 0;
        let radCost = 0;
        let costPct = 0;
        let costRaw = 0;
        let currentSpellCost = 0;
        for (let i = 1; i <= 4; i++) {
            currentSpellCost = cost[i-1];
            costPct = document.getElementById("costPct"+i).value;
            costRaw = document.getElementById("costRaw"+i).value;

            if (costPct == -100) {
                document.getElementById("manaUsageRad").innerHTML = "?";
                document.getElementById("outputRad").innerHTML = "?";
                document.getElementById("manaUsageAvgRad").innerHTML = "?";
                document.getElementById("outputAvgRad").innerHTML = "?";
                return;
            } else if (costPct < -100 && currentSpellCost == 1) {
                additionalInfo.classList.remove("hidden");
            }

            baseCost = currentSpellCost / (1 + costPct/100) - costRaw;

            if (costPct <= 0) {
                costPct = costPct * radMultiplier;
            }
            if (costRaw <= 0) {
                costRaw = costRaw * radMultiplier;
            }

            radCost = (baseCost + parseFloat(costRaw)) * (1 + parseFloat(costPct)/100);
            costRad.push(radCost);
        }
        console.log(costRad);

        cycle = getCycle();

        for (let i = 0; i < cycle.length; i++) {
            for (let j = 0; j < 4; j++) {
                if (cycle[i] === j + 1) {
                    cycle[i] = [costRad[j], j + 1];
                }
            }
        }

        while (cycle[0][1] === cycle[cycle.length - 1][1]) {
            cycle.unshift(cycle.pop());
        }

        let cycle_costRad = [];
        for (let i = 0; i < 2; i++) {
            if (cycle[i][0] <= 1) {
                cycle_costRad.push(1);
            } else {
                cycle_costRad.push(cycle[i][0]);
            }
        }

        let repeatRad = 0;
        for (let i = 2; i < cycle.length; i++) {
            if (cycle[i - 1][1] === cycle[i - 2][1]) {
                repeatRad++;
                if (cycle[i][0] + repeatRad * 5 <= 1) {
                    cycle_costRad.push(1);
                } else {
                    cycle_costRad.push(cycle[i][0] + repeatRad * 5);
                }
            } else {
                repeatRad = 0;
                if (cycle[i][0] <= 1) {
                    cycle_costRad.push(1);
                } else {
                    cycle_costRad.push(cycle[i][0]);
                }
            }
        }

        
        if (cycle[cycle.length - 1][1] === cycle[cycle.length - 2][1]) {
            repeatRad++; // Increment repeat for the last repetition
            if (cycle[0][0] + repeatRad * 5 > 1) {
                cycle_costRad[0] += repeatRad * 5;
            }
        }
        
        // Factoring in Transcendence
        if (document.getElementById("transcendence").checked) {
            console.log(cycle_costRad);
            for (let i = 0; i < cycle.length; i++) {
                cycle_costRad[i] = cycle_costRad[i] * 0.7;
            }
            console.log(cycle_costRad);
        }
        
        // Factoring in Masks
        if (masksCheckbox.checked) {
            // console.log("Rad Before masks: "+cycle_costRad);
            for (let i = 0; i < cycle_costRad.length; i++) {
                let spellIndex = cycle[i][1]; // Spell index (1-4)
                let spellCostRad = cycle_costRad[i]; // Spell cost
            
                // Check for each spell and its corresponding checkbox
                switch (spellIndex) {
                    case 1:
                        if (fanaticCheckbox.checked) {
                            spellCostRad *= 0.35;
                        }
                        break;
                    case 2:
                        if (cowardCheckbox.checked) {
                            spellCostRad *= 0.5;
                        }
                        break;
                    case 3:
                        if (lunaticCheckbox.checked) {
                            spellCostRad *= 0.7;
                        }
                        break;
                }
                cycle_costRad[i] = spellCostRad; // Update the cycle cost
            }
            // console.log("Rad After masks: "+cycle_costRad);
        }

        let manaPerSecondRad = mr_ms_per_s[1] + cycle_gain_per_s - cps * cycle_costRad.reduce((acc, val) => acc + val, 0) / cycle_cost.length / 3;
        let manaPerSecondAvgRad = (manaPerSecondRad * 8 + manaPerSecond * 7) / 15;
        document.getElementById("manaUsageRad").innerHTML = (manaPerSecondRad - mr_ms_per_s[1] - cycle_gain_per_s).toFixed(2);
        document.getElementById("manaUsageAvgRad").innerHTML = (manaPerSecondAvgRad - mr_ms_per_s[2] - cycle_gain_per_s).toFixed(2);
        document.getElementById("outputRad").innerHTML = manaPerSecondRad.toFixed(2);
        document.getElementById("outputAvgRad").innerHTML = manaPerSecondAvgRad.toFixed(2);
        updateShadow(manaPerSecondAvgRad);
    }
}