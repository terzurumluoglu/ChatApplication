import { ConversationIsActivePipe } from './conversation-is-active.pipe';

describe('conversationIsActivePipe', () => {
  it('create an instance', () => {
    const pipe = new ConversationIsActivePipe();
    expect(pipe).toBeTruthy();
  });
});