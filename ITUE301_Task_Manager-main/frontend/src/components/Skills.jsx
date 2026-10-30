export default function Skills({skillList}){return <section className="card"><h2>Skills</h2><ul>{skillList.map(skill=><li key={skill}>{skill}</li>)}</ul></section>}
