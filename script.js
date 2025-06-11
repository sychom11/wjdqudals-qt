document.addEventListener('DOMContentLoaded', function() {
    // 상태 변수
    let currentDate = new Date();
    let selectedDate = null;
    
    // 메모 데이터를 저장할 객체
    // 형식: { '2025-6-11': '메모 내용', ... }
    let memos = {};
    
    // localStorage에서 메모 데이터 불러오기
    const loadMemos = () => {
        const savedMemos = localStorage.getItem('calendarMemos');
        memos = savedMemos ? JSON.parse(savedMemos) : {};
    };
    
    // 메모 데이터를 저장하는 함수
    const saveMemos = () => {
        localStorage.setItem('calendarMemos', JSON.stringify(memos));
    };
    
    // 메모 데이터 초기 로딩
    loadMemos();
    
    // 캘린더 요소
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    
    // 모달 요소
    const memoModal = document.getElementById('memo-modal');
    const memoDateElement = document.getElementById('memo-date');
    const memoTextElement = document.getElementById('memo-text');
    const saveMemoButton = document.getElementById('save-memo');
    const closeModalButton = document.querySelector('.close');
    
    // 날짜 포맷팅 함수
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month}-${day}`;
    };
    
    // 한국어 월 이름
    const monthNames = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    // 캘린더 헤더 업데이트 함수
    const updateCalendarHeader = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        currentMonthYearElement.textContent = `${year}년 ${monthNames[month]}`;
    };
    
    // 캘린더 날짜 생성 함수
    const renderCalendar = () => {
        // 현재 달의 첫 날과 마지막 날
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // 첫 날의 요일 (0: 일요일, 1: 월요일, ...)
        const firstDayOfWeek = firstDay.getDay();
        
        // 이전 달의 마지막 날
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
        // 헤더 업데이트
        updateCalendarHeader();
        
        // 캘린더 비우기
        calendarDays.innerHTML = '';
        
        // 이전 달의 날짜 채우기
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('empty');
            
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('date');
            dateSpan.textContent = prevMonthLastDay - i;
            
            dayElement.appendChild(dateSpan);
            calendarDays.appendChild(dayElement);
        }
        
        // 현재 달의 날짜 채우기
        const today = new Date();
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement('div');
            
            // 요일 확인 (0: 일요일, 6: 토요일)
            const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), i).getDay();
            
            if (dayOfWeek === 0) {
                dayElement.classList.add('sunday');
            } else if (dayOfWeek === 6) {
                dayElement.classList.add('saturday');
            }
            
            // 오늘 날짜 확인
            if (today.getFullYear() === currentDate.getFullYear() &&
                today.getMonth() === currentDate.getMonth() &&
                today.getDate() === i) {
                dayElement.classList.add('today');
            }
            
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('date');
            dateSpan.textContent = i;
            
            dayElement.appendChild(dateSpan);
            
            // 해당 날짜의 메모가 있는지 확인
            const dateKey = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
            if (memos[dateKey]) {
                const memoIndicator = document.createElement('div');
                memoIndicator.classList.add('memo-indicator');
                memoIndicator.textContent = memos[dateKey].length > 20 ? 
                    memos[dateKey].substring(0, 20) + '...' : memos[dateKey];
                dayElement.appendChild(memoIndicator);
            }
            
            // 날짜 클릭 이벤트
            dayElement.addEventListener('click', () => {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                openMemoModal(selectedDate);
            });
            
            calendarDays.appendChild(dayElement);
        }
        
        // 다음 달의 날짜 채우기 (필요한 경우)
        const totalDaysRendered = firstDayOfWeek + lastDay.getDate();
        const daysToAdd = totalDaysRendered % 7 === 0 ? 0 : 7 - (totalDaysRendered % 7);
        
        for (let i = 1; i <= daysToAdd; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('empty');
            
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('date');
            dateSpan.textContent = i;
            
            dayElement.appendChild(dateSpan);
            calendarDays.appendChild(dayElement);
        }
    };
    
    // 메모 모달 열기
    const openMemoModal = (date) => {
        const dateStr = formatDate(date);
        const koreanDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        
        memoDateElement.textContent = koreanDate;
        memoTextElement.value = memos[dateStr] || '';
        
        memoModal.style.display = 'block';
    };
    
    // 메모 모달 닫기
    const closeMemoModal = () => {
        memoModal.style.display = 'none';
    };
    
    // 메모 저장
    const saveMemo = () => {
        if (selectedDate) {
            const dateStr = formatDate(selectedDate);
            const memoText = memoTextElement.value.trim();
            
            if (memoText) {
                memos[dateStr] = memoText;
            } else {
                // 메모가 비어있으면 삭제
                delete memos[dateStr];
            }
            
            saveMemos();
            renderCalendar();
            closeMemoModal();
        }
    };
    
    // 이전 달로 이동
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    // 다음 달로 이동
    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // 모달 닫기 버튼
    closeModalButton.addEventListener('click', closeMemoModal);
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === memoModal) {
            closeMemoModal();
        }
    });
    
    // 메모 저장 버튼
    saveMemoButton.addEventListener('click', saveMemo);
    
    // 초기 캘린더 렌더링
    renderCalendar();
});