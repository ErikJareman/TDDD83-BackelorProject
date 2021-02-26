import $ from 'jquery';

// Interfaces är lite annorlunda från Java
// Här används de ofta för att beskriva ett object {}
interface testType {
    test: string;
    age: number;
}

// Arrow function med typer för parametrar och output
const createHTML = (input: testType): string => {
    return `
    <p>${input.test}</p>
    <p>Jag är ${input.age} år gammal.</p>
    `;
};

const main = () => {
    const data: testType = {
        test: 'Hello World!',
        age: 12,
    };

    $('#app').html(createHTML(data));
};

$(main);
