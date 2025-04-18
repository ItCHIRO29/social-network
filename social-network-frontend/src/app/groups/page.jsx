"use client";
import styles from "./groups.module.css";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Groups() {
  const [activeButton, setActiveButton] = useState("your groups");
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [createError, setCreateError] = useState(null);
  const router = useRouter();
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [currentPageUsers, setCurrentPageUsers] = useState(0);
  const [currentPageGroups, setCurrentPageGroups] = useState(0);
  const [loading, setLoading] = useState(false)
  const usersObserver = useRef();
  const groupsObserver = useRef();

  useEffect(() => {
    console.log("active button changed lol");

    setCurrentPageGroups(0);
    setCurrentPageUsers(0);
    setHasMoreGroups(true);
    setHasMoreUsers(true);
    setGroups([]);
    setUsers([]);
    fetchGroups();
    if (activeButton !== "your groups") {
      setShowCreateForm(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setSelectedUsers([]);
    }
  }, [activeButton]);

  useEffect(() => {
    if (showCreateForm) {
      fetchUsers(0);
    }
  }, [showCreateForm, currentPageUsers]);

  const fetchUsers = useCallback(
    async (groupId) => {
      if (!hasMoreUsers || loading) return;
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPageUsers,
        group_id: groupId,
      });
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL +
          `/api/groups/get_members_to_invite?${params}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data) {
          setUsers((prev) => [...prev, ...data]);
        } else {
          setHasMoreUsers(false);
        }
        console.log(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false)
      }
    },
    [currentPageUsers, hasMoreUsers]
  );

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const fetchGroups = useCallback(async () => {
    if (!hasMoreGroups || loading) return;
    setLoading(true)
    const params = new URLSearchParams({ page: currentPageGroups });
    try {
      let endpoint = "";
      switch (activeButton) {
        case "your groups":
          endpoint = `/api/groups/getGroups/MyGroups?${params}`;
          break;
        case "joined groups":
          endpoint = `/api/groups/getGroups/joined?${params}`;
          break;
        default:
          endpoint = `/api/groups/getGroups/all?${params}`;
      }
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + endpoint, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data) {
        // setGroups((prev) => [...prev, ...data]);
        setGroups((prev) => {
          const existingIds = new Set(prev.map((u) => u.id)); // assuming unique `id`
          const filteredData = data.filter((grp) => !existingIds.has(grp.id));
          return [...prev, ...filteredData];
        });
      } else {
        setHasMoreGroups(false);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false)
    }
  }, [currentPageGroups, hasMoreGroups, activeButton]);

  const lastUserRef = useCallback(
    (node) => {
      if (usersObserver.current) usersObserver.current.disconnect();
      usersObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreUsers) {
          setCurrentPageUsers((prevPage) => prevPage + 1);
        }
      });
      if (node) usersObserver.current.observe(node);
    },
    [hasMoreUsers]
  );

  const lastGroupRef = useCallback(
    (node) => {
      if (groupsObserver.current) groupsObserver.current.disconnect();
      groupsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreGroups) {
          setCurrentPageGroups((prevPage) => prevPage + 1);
        }
      });
      if (node) groupsObserver.current.observe(node);
    },
    [hasMoreGroups]
  );

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/groups/create_group",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: newGroupName,
            description: newGroupDescription,
            invited_users: selectedUsers,
          }),
        }
      );

      if (response.ok) {
        setCreateError(null);
        setShowCreateForm(false);
        setNewGroupName("");
        setNewGroupDescription("");
        setSelectedUsers([]);
        fetchGroups();
      } else {
        const data = await response.json();
        if (response.status === 400) {
          console.error("Group creation failed:", data);
          setCreateError(data);
        } else {
          console.error("Unexpected error:", data);
          setCreateError("Failed to create group Try again later");
        }
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
        `/api/groups/join?group_id=${groupId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to join group");
      } else {
        setGroups(groups.filter((grp) => grp.id != groupId));
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
        `/api/groups/leave?groupId=${groupId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to leave group");
      } else {
        setGroups(groups.filter((grp) => grp.id != groupId));
      }
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const handleExpandCommunity = (groupId) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
    if (expandedGroupId !== groupId) {
      fetchUsers(groupId);
    }
  };

  const handleInviteToGroup = async (groupId) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/api/groups/invitation`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: groupId,
            invited_users: selectedUsers,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to invite users");
      }
      setSelectedUsers([]);
      setExpandedGroupId(null);
    } catch (error) {
      console.error("Error inviting users:", error);
    }
  };

  return (
    <div className="main-content">
      <h1>Groups</h1>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeButton === "your groups" ? styles.active : ""
                }`}
              onClick={() => setActiveButton("your groups")}
            >
              Your Groups
            </button>
            <button
              className={`${styles.tab} ${activeButton === "joined groups" ? styles.active : ""
                }`}
              onClick={() => setActiveButton("joined groups")}
            >
              Joined Groups
            </button>
            <button
              className={`${styles.tab} ${activeButton === "all groups" ? styles.active : ""
                }`}
              onClick={() => setActiveButton("all groups")}
            >
              Find New Communities
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {activeButton === "your groups" && (
            <>
              {!showCreateForm ? (
                <button
                  className={styles.createButton}
                  onClick={() => setShowCreateForm(true)}
                >
                  Create New Group
                </button>
              ) : (
                <div className={styles.createForm}>
                  <h3>Create New Group</h3>
                  <form onSubmit={handleCreateGroup}>
                    <input
                      type="text"
                      placeholder="Group Name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      required
                    />
                    <textarea
                      placeholder="Group Description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      required
                    />

                    <div className={styles.inviteSection}>
                      <h4>Invite Users</h4>
                      <div className={styles.usersList}>
                        {users.map((user, index) => (
                          <label
                            key={user.id}
                            className={styles.userItem}
                            ref={users.length - 1 == index ? lastUserRef : null}
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleUserSelect(user.id)}
                            />
                            <span className={styles.checkmark}></span>
                            <span className={styles.username}>
                              {user.username}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {createError && (
                      <div className={styles.error}>{createError}</div>
                    )}
                    <div className={styles.formActions}>
                      <button type="submit">Create</button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {groups.length === 0 ? (
                <div className={styles.emptyState}>
                  You haven't created any groups yet
                </div>
              ) : (
                <div className={styles.groupsGrid}>
                  {groups.map((group, index) => (
                    <div
                      key={`${activeButton}-${group.id}`}
                      className={styles.groupCard}
                      ref={groups.length - 1 == index ? lastGroupRef : null}
                    >
                      <h3>{group.name}</h3>
                      <p>{group.description}</p>
                      <div className={styles.groupActions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => router.push(`/groups/${group.name}`)}
                        >
                          Go to Group
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleExpandCommunity(group.id)}
                        >
                          Expand Community
                        </button>
                        {expandedGroupId === group.id && (
                          <div className={styles.popupOverlay}>
                            <div className={styles.invitePopup}>
                              <div className={styles.popupHeader}>
                                <h3>Invite Users to {group.name}</h3>
                                <button
                                  className={styles.closeButton}
                                  onClick={() => {
                                    setExpandedGroupId(null);
                                    setSelectedUsers([]);
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                              <div className={styles.usersList}>
                                {users.map((user) => (
                                  <label
                                    key={user.id}
                                    className={styles.userItem}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedUsers.includes(user.id)}
                                      onChange={() => handleUserSelect(user.id)}
                                    />
                                    <span className={styles.checkmark}></span>
                                    <span className={styles.username}>
                                      {user.username}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <div className={styles.popupActions}>
                                <button
                                  className={styles.inviteButton}
                                  onClick={() => handleInviteToGroup(group.id)}
                                  disabled={selectedUsers.length === 0}
                                >
                                  Invite Selected Users
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeButton !== "your groups" && (
            <>
              {groups.length === 0 ? (
                <div className={styles.emptyState}>
                  No groups found in this section
                </div>
              ) : (
                <div className={styles.groupsGrid}>
                  {groups.map((group) => (
                    <div
                      key={`${activeButton}-${group.id}`}
                      className={styles.groupCard}
                    >
                      <h3>{group.name}</h3>
                      <p>{group.description}</p>
                      <div className={styles.groupActions}>
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            (window.location.href = `/groups/${group.name}`)
                          }
                        >
                          Go to Group
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleExpandCommunity(group.id)}
                        >
                          Expand Community
                        </button>
                        {expandedGroupId === group.id && (
                          <div className={styles.popupOverlay}>
                            <div className={styles.invitePopup}>
                              <div className={styles.popupHeader}>
                                <h3>Invite Users to {group.name}</h3>
                                <button
                                  className={styles.closeButton}
                                  onClick={() => {
                                    setExpandedGroupId(null);
                                    setSelectedUsers([]);
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                              <div className={styles.usersList}>
                                {users.map((user) => (
                                  <label
                                    key={user.id}
                                    className={styles.userItem}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedUsers.includes(user.id)}
                                      onChange={() => handleUserSelect(user.id)}
                                    />
                                    <span className={styles.checkmark}></span>
                                    <span className={styles.username}>
                                      {user.username}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <div className={styles.popupActions}>
                                <button
                                  className={styles.inviteButton}
                                  onClick={() => handleInviteToGroup(group.id)}
                                  disabled={selectedUsers.length === 0}
                                >
                                  Invite Selected Users
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {activeButton === "all groups" && (
                          <button
                            className={styles.joinButton}
                            onClick={() => handleJoinGroup(group.id)}
                          >
                            Join Group
                          </button>
                        )}
                        {activeButton === "joined groups" && (
                          <button
                            className={styles.leaveButton}
                            onClick={() => handleLeaveGroup(group.id)}
                          >
                            Leave Group
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
