var Music = (function (){

	function subdivisionToSeconds(subdivision, bpm){
		//return (duration of one beat)*(fraction of one beat)
		return (60.0/bpm)*(subdivision*4);
	}
	/*Calcula los tiempos en los que ocurren los eventos basados en notacion
	musical. Retorna arreglo de triggers*/
	function beatstringToEvents (pattern, subd, bpm){
		//pattern = string of triggers. x note, . silence
		//subd = subdivision (1/4, 1/8, etc)
		var timeArr = []; //array to store the values from calculation
		var unitDur = subdivisionToSeconds(subd, bpm); //Duration of a subdivision note
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
		else return null;
	}

	function createEnvelope(envelopeType, timeConstants){
		var envelope = {};

		if (envelopeType === 'AD'){
					envelope.times = [timeConstants[0], timeConstants[0] + timeConstants[1]];
					envelope.values = [1.0,0.0];
		}
		else if (envelopeType === 'ASD'){
					envelope.times = [timeConstants[0],
							timeConstants[0] + timeConstants[1],
							timeConstants[0] + timeConstants[1] + timeConstants[2]];
					envelope.values = [1.0, 1.0, 0.0];
		}

		return envelope;
	}

	/*Calcula los tiempos en los que ocurren los eventos correspondientes
	a los envolventes para cada trigger. Retorna arreglos con eventos para cada trigger*/
	/*Pendientes: Agregar envolventes */
	// values = timeConstants
	function createTriggerEnvelopeArray (triggers, envelopeType, timeConstants){
		var outArray = [];
		var envelope = createEnvelope(envelopeType, timeConstants);

		for (var i = 0; i < triggers.length; i++){
			var times = [];
			var values = [];
			for (var j = 0; j < envelope.times.length; j++){
				times.push(triggers[i] + envelope.times[j]);
				values.push(envelope.values[j]);
			}

			outArray.push({
				times: times,
				values: values
			})
		}

		return outArray;
	}

	function lerp (x, x1, y1, x2, y2){
		var f1 = x - x1;
		var f2 = x2 - x1;
		var f3 = x2 - x;

		var a = 1 - f1/f2;
		var b = 1 - f3/f2;

		var y = y1*a + y2*b;

		return y;
	}

	//Retorna arreglo de objetos 
	//con las parejas tiempo,valor a partir de triggers y sus envolventes
	//Normalizado a 1.0
	function createGraph (triggers, envs){
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
			//Set current time first, but true value depends on overriding
			keyValues.times.push(triggers[i]);
			keyValues.values.push(lastValue.value > 0? lastValue.value:0.0);

			lastValue.time = keyValues.times[keyValues.times.length-1];
			lastValue.value = keyValues.values[keyValues.values.length-1];

			//Now add Env Keys
			for(var j = 0; j < envs[i].times.length; j++){
				var nextTrig = triggers[i+1];
				var currentTime = envs[i].times[j];
				if(currentTime < nextTrig){
					keyValues.times.push(currentTime);
					keyValues.values.push(envs[i].values[j]);

					lastValue.time = keyValues.times[keyValues.times.length-1];
					lastValue.value = keyValues.values[keyValues.values.length-1];
				}
				else{
					lastValue.value = lerp(nextTrig, envs[i].times[j], envs[i].values[j], lastValue.time, lastValue.value);
					lastValue.time = nextTrig;
					break;
				}
			}
		}

		//Seccion para el ultimo trigger

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

	

	return {
		subdivisionToSeconds: subdivisionToSeconds,
		beatstringToEvents: beatstringToEvents,
		createEnvelope: createEnvelope,
		createTriggerEnvelopeArray: createTriggerEnvelopeArray,
		createGraph: createGraph

	};

})();











