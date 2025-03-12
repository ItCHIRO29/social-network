export default function CreateGroup() {
    const handleCreateGroup = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log(data);
        fetch("http://localhost:8080/api/groups/createGroup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        })
        e.target.reset();
    }


    return (
        <>
            <form id="createGroup" onSubmit={handleCreateGroup} >
                <section id="group-description">
                    <input type="text" name="name" placeholder="Group Name" />
                    <textarea name="description" placeholder="Description" />
                </section>
                <button className="btn" type="submit">Create Group</button>
            </form>
        </>
    );
}