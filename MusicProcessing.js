/*Calcula los tiempos en los que ocurren los eventos basados en notacion
musical. Retorna arreglo de triggers*/
function timeFromBeats (pattern, subd, bpm){
	//pattern = string of triggers. x note, . silence
	//subd = subdivision (1/4, 1/8, etc)
	var timeArr = []; //array to store the values from calculation
	var unitDur = (60.0/bpm)*subd*4; //Duration of a subdivision note
	var acummTime = 0;

	if(pattern.length > 0){
		for (var i = 0; i < pattern.length; i++) {
			if (pattern[i] == 'x') {
				timeArr.push(acummTime); //Found a trigger
				acummTime += unitDur;
			}
			else if (pattern[i] == '.') {
				acummTime += unitDur;
			}
		}

		return timeArr;
	}
	else return false;
}

/*Calcula los tiempos en los que ocurren los eventos correspondientes
a los envolventes para cada trigger. Retorna arreglos con eventos para cada trigger*/
/*Pendientes: Agregar envolventes */
// values = timeConstants
function calcEnvelope (typeEnv, tConstants, triggers){
	var outArray = [];

	if (typeEnv == 'AD') {
		temp = [];
		for (var i = 0; i < triggers.length; i++) {
			outArray.push({
				times: [triggers[i] + tConstants[0], triggers[i] + tConstants[0] + tConstants[1]],
				values: [1.0,0.0]
			})
		}
	}

	return outArray;
}

//Retorna arreglo de objetos 
//con las parejas tiempo,valor a partir de triggers y sus envolventes
//Normalizado a 1.0
function setGraph (triggers, envs){
	var keyValues = {
		times: [],
		values: []
	}
	var lastValue = {
		time:0.0,
		value:0.0
	};

	//seccion para los primeros n-1 triggers
	for(var i = 0; i < triggers.length - 1; i++){
		//Set current time first, but value depends on overriding
		keyValues.times.push(triggers[i]);
		keyValues.values.push(lastValue.value > 0? lastValue.value:0.0);

		lastValue.time = keyValues.times[keyValues.times.length-1];
		lastValue.value = keyValues.values[keyValues.values.length-1];

		//Now add Env Keys
		for(var j = 0; j < envs[i].times.length; j++){
			var nextTrig = triggers[i+1];
			var currentT = envs[i].times[j];
			if(currentT < nextTrig){
				keyValues.times.push(currentT);
				keyValues.values.push(envs[i].values[j]);

				lastValue.time = keyValues.times[keyValues.times.length-1];
				lastValue.value = keyValues.values[keyValues.values.length-1];
			}
			else{
				var m = (envs[i].values[j] - lastValue.value)/(envs[i].times[j] - lastValue.time);
				var b = envs[i].values[j] - m*envs[i].times[j];

				var interpVal = m*(nextTrig) + b;

				lastValue.time = nextTrig;
				lastValue.value = interpVal;
				break;
			}
		}
	}

	var lastindex = triggers.length-1;
	keyValues.times.push(triggers[lastindex]);
	keyValues.values.push(lastValue.value > 0? lastValue.value:0.0);

	lastValue.time = keyValues.times[keyValues.times.length-1];
	lastValue.value = keyValues.values[keyValues.values.length-1];

		//Now add Env Keys
	for(var j = 0; j < envs[lastindex].times.length; j++){
		keyValues.times.push(envs[lastindex].times[j]);
		keyValues.values.push(envs[lastindex].values[j]);
	}

	return keyValues;
}

function setGraph2 (triggers, envs){
	var keyValues = [];
	var currentT;
	var tempObj = {
		time:0.,
		val:0.
	};
	var newTrig = true;
	var lastKey = {
		time: 0.,
		val: 0.
	}

	for (var i = 0; i < triggers.length - 1; i++) {
		currentT = triggers[i];
		tempObj.time = currentT;
		tempObj.val = lastKey.val;
		keyValues.push({
			time: tempObj.time,
			val: tempObj.val
		});

		for (var j = 0; j < 2; j++){
			if (envs[i][j] < triggers[i+1]) {
				tempObj.time = envs[i][j];
				tempObj.val = j == 0? 1.0:0.0;
				lastKey.time = tempObj.time;
				lastKey.val = tempObj.val;
				keyValues.push({
				time: tempObj.time,
				val: tempObj.val
				});
			}
			else{
				var m = ((j == 0?1.0:0.0)-lastKey.val)/(envs[i][j]-lastKey.time);
				var b = lastKey.val - m*lastKey.time;
				lastKey.val = m*triggers[i+1] + b;
				lastKey.time = triggers[i];
				break;
			}
		}
		var i = triggers.length-1;
		tempObj.time = triggers[i];
		tempObj.val = lastKey.val;
		keyValues.push({
			time: tempObj.time,
			val: tempObj.val
		});
		for (var j = 0; j < 2; j++){
			tempObj.time = envs[i][j];
			tempObj.val = j == 0? 1.0:0.0;
			lastKey.time = tempObj.time;
			lastKey.val = tempObj.val;
			keyValues.push({
			time: tempObj.time,
			val: tempObj.val
			});
		}




	}
	return keyValues;
}










