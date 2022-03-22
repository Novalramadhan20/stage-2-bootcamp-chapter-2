let projects = []

function addProject() {
    let title = document.getElementById("project-name").value;
    let start = document.getElementById("start-date") .value;
    let end = document.getElementById("end-date").value;
    let desc = document.getElementById("description").value;
    let nodeJS = document.getElementById("nodeJS").checked;
    let nextJS = document.getElementById("nextJS").checked;
    let reactJS = document.getElementById("reactJS").checked;
    let typeScript = document.getElementById("typeScript").checked;
    let image = document.getElementById("input-project-image").files [0];

    if (title == '' || start == '' || end == '' || desc == '' ||image == ''){
        return alert ( 'All input fields must be not empty');
    }

    image = URL.createObjectURL(image);

    let startFull = new Date(start);
    let endFull = new Date(end);

    let project = {
        title: title,
        start: startFull,
        end: endFull,
        desc: desc,
        nodeJS: nodeJS,
        nextJS: nextJS,
        reactJS: reactJS,
        typeScript: typeScript,
        image: image,       
    }

    projects.push(project)

    renderProject()

}
function getIcon(nodeJS, nextJS, reactJS, typeScript) {

    let printIcon = ``
    if (nodeJS == true) {
        printIcon += `<img src="asset/nodejs.png" />` 
    }
    if (nextJS == true) {
        printIcon += `<img src="asset/nextjs.svg" />` 
    }
    if (reactJS == true) {
        printIcon += `<img src="asset/reactjs.png" />` 
    }
    if (typeScript == true) {
        printIcon += `<img src="asset/typescript.png" />` 
    }

    return printIcon

}


function renderProject() {

    let projectContainer = document.getElementById('contents') 

    projectContainer.innerHTML =  firstProjectContent();
               
    for (let i = 0; i < projects.length; i++)  {

        projectContainer.innerHTML += 
       `<div id="${i}class="project-list" id="contents"> 
            <div class="project-list-item">
                <div class="project-image">
                    <img src="${projects[i].image}" alt="mobileapp" />
                </div>
                <div class="project-content">
                    <h3>
                        <a href="project-detail.html" target="_blank"
                        >${projects[i].title}</a>
                    </h3>
                </div>    
                <div class="detail-project-content">
                    <h5>durasi : ${getTimeDistance(projects[i].start, projects[i].end)}
                    </h5>
                    <p>${projects[i].desc}</p>
                </div>    
                <div class="project-technologies">
                <div>
                    <img ${getIcon(projects[i].nodeJS, projects[i].nextJS, projects[i].reactJS, projects[i].typeScript)}
                </div>
                <div class="btn-group">
                            <a href="#" class="btn-edit">edit</a>
                            <span></span>
                            <a href="#" class="btn-delete">delete</a>
                </div>
            </div>
        </div>   
        
    `;
}


}

function getTimeDistance(start, end) {


    let distance = end - start

    let yearDistance = Math.floor(distance / (12 * 4 * 7 * 24 * 60 * 60 * 1000))

    if (yearDistance != 0) {
        return `${yearDistance} Tahun`
    } else {
        let monthDistance = Math.floor(distance / (4 * 7 * 24 * 60 * 60 * 1000))
        if (monthDistance != 0) {
            return `${monthDistance} Bulan`
        } else {
            let weekDistance = Math.floor(distance / (7 * 24 * 60 * 60 * 1000))
            if (weekDistance != 0) {
                return `${weekDistance} Minggu`
            } else {
                let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000))

                return `${dayDistance} Hari`
            }
        }
    }
    
}

function firstProjectContent() {
   return `<div class="project-list" id="contents">
                <div class="project-list-item"> 
                    <div class="project-image">
                        <img src="asset/mobileapp.jpeg" alt="mobileapp" />
                    </div>
                    <div class="project-content">
                        <h3>
                        <a href="project-detail.html" target="_blank"
                        >Dumbways Mobile App -2021</a>
                        </h3>
                    </div>    
                    <div class="detail-project-content">
                        <h5>durasi : 3 bulan
                        </h5>
                        <p>App that used for dumbways student, it was deployed and can downloaded on playstore. Happy download 
                        </p>
                    </div>    
                    <div class="project-technologies">
                    <div>
                        <img src="asset/playstore.png">
                        <img src="asset/android.png">
                        <img src="asset/java.png">
                    </div>
                    <div class="btn-group">
                        <a href="#" class="btn-edit">edit</a>
                        <span></span>
                        <a href="#" class="btn-delete">delete</a>
                    </div>
                </div> `;
}