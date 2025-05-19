let meetings = JSON.parse(localStorage.getItem("meetings")) || [];

function formatAMPM(time) {
  let [h, m] = time.split(":");
  let suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

function getStatus(startDate, endDate, startTime, endTime) {
  const now = new Date();
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  if (now < start) return "Pending";
  else if (now >= start && now <= end) return "Active";
  else return "Completed";
}

function renderTable() {
  const tbody = document.querySelector("#meetingsTable tbody");
  tbody.innerHTML = "";

  meetings.forEach((m, i) => {
    const status = getStatus(m.startDate, m.endDate, m.startTime, m.endTime);
    tbody.innerHTML += `
      <tr>
        <td>${m.startDate} - ${m.endDate}</td>
        <td>${formatAMPM(m.startTime)} - ${formatAMPM(m.endTime)}</td>
        <td>${m.room}</td>
        <td>${m.bookingBy}</td>
        <td>${m.description}</td>
        <td class="status-${status.toLowerCase()}">${status}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editMeeting(${i})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteMeeting(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });
}

function resetForm() {
  document.getElementById("meetingForm").reset();
  document.getElementById("meetingId").value = "";
}

function openModal(editing = false) {
  const modalTitle = document.getElementById("modalTitle");
  modalTitle.textContent = editing ? "Edit Meeting" : "Book a Meeting";
  new bootstrap.Modal(document.getElementById("meetingModal")).show();
}

document.getElementById("bookMeetingBtn").addEventListener("click", () => {
  resetForm();
  openModal();
});

document.getElementById("meetingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
    room: document.getElementById("room").value,
    description: document.getElementById("description").value,
    bookingBy: document.getElementById("bookingBy").value,
  };

  const id = document.getElementById("meetingId").value;
  const isEdit = id !== "";

  // Check for duplicates
  const isDuplicate = meetings.some((m, i) =>
    m.startDate === data.startDate &&
    m.endDate === data.endDate &&
    m.startTime === data.startTime &&
    m.endTime === data.endTime &&
    m.room === data.room &&
    (!isEdit || parseInt(id) !== i)
  );

  if (isDuplicate) {
    alert("❗This time slot is already booked.");
    return;
  }

  if (isEdit) meetings[id] = data;
  else meetings.push(data);

  localStorage.setItem("meetings", JSON.stringify(meetings));
  renderTable();
  bootstrap.Modal.getInstance(document.getElementById("meetingModal")).hide();
});

function editMeeting(index) {
  const m = meetings[index];
  document.getElementById("meetingId").value = index;
  document.getElementById("startDate").value = m.startDate;
  document.getElementById("endDate").value = m.endDate;
  document.getElementById("startTime").value = m.startTime;
  document.getElementById("endTime").value = m.endTime;
  document.getElementById("room").value = m.room;
  document.getElementById("description").value = m.description;
  document.getElementById("bookingBy").value = m.bookingBy;

  openModal(true);
}

function deleteMeeting(index) {
  if (confirm("Are you sure to delete this meeting?")) {
    meetings.splice(index, 1);
    localStorage.setItem("meetings", JSON.stringify(meetings));
    renderTable();
  }
}

renderTable();
