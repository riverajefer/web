document.addEventListener('DOMContentLoaded', function() {
    $('.ejecutando').hide();

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            console.log('user login', user)
            $('.login_section').hide();
            $('.section_project').show();
        } else {
            $('.login_section').show();
            $('.section_project').hide();
            console.log('User is signed out');
        }
    });


    const data = {
        datasets: []
    };
    const config = {
        type: 'scatter',
        data: data,
        options: {
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {

                y: {
                    title: {
                        display: true,
                        text: 'Distancia de caida libre (cm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (micro segundos)'
                    }
                },
                yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'probability'
                        }
                    },

                ]
            },
        }
    };
    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    );

    let counter = 0;
    let data_resp = [];

    firebase.database().ref('experimento').on('value', snapshot => {
        counter = snapshot.val().counter;
        data_resp = snapshot.val().data;
        console.log('data resp', data_resp);
        if (data_resp !== undefined) {
            $('#enviar').attr('disabled', false);
            $('.ejecutando').hide();
            setGraph(data_resp);
            myChart.update();
        }
    });


    function setGraph(data_resp) {
        myChart.config.data.datasets = [];
        console.log(data_resp);

        let labels_data = []
        let repetition = []
        let map_xy = [
            []
        ];

        for (let i = 0; i < data_resp.length; i++) {
            map_xy[i] = []
            repetition = data_resp[i];
            for (let j = 0; j < repetition.length; j++) {
                map_xy[i][j] = {
                    x: repetition[j],
                    y: j * 10
                }
            }
        }

        for (let i = 0; i < map_xy.length; i++) {
            myChart.config.data.datasets.push({
                label: `Repetición: ${i+1}`,
                data: map_xy[i],
                showLine: true,
                fill: false,
                backgroundColor: '#ff0000',
                borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16)
            })

        }
        console.log('map_xy', map_xy)

    }

    function clearGraph() {
        myChart.config.data.datasets = [];
        myChart.update();
    }


    // se ejecuta cuando se da click en el boton de enviar
    $("#enviar").click(function(event) {
        $('#enviar').attr('disabled', true);
        $('.ejecutando').show();
        clearGraph();

        event.preventDefault();
        const distancia = $('#distancia').val();
        const repeticiones = $('#repeticiones').val();
        console.log('distancia: ', distancia, 'repeticiones: ', repeticiones);
        counter = counter + 1;

        firebase.database().ref('experimento').set({
            distancia: distancia,
            repeticiones: repeticiones,
            counter: counter,
        }, (error) => {
            if (error) {
                console.log('error: ', error);
            } else {
                console.log('Data saved successfully');
            }
        });
    });

    // se ejecuta cuando se da click en el boton de login
    $('#form_login').submit(function(e) {
        e.preventDefault();
        console.log('login Form');
        const email = $('#email').val();
        const password = $('#password').val();

        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                return firebase.auth().signInWithEmailAndPassword(email, password);
            })
            .catch((error) => {
                console.log('error: ', error);
                const errorMessage = error.message;
                $('#password').text();
                alert(errorMessage);
            }).then((userCredential) => {
                $('.login_section').hide();
                $('.section_project').show();
                var user = userCredential.user;
                console.log('user login: ', user);
            });

    });

});